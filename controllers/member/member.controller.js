import RedanMember from '../../models//member.model.js';
import { deleteFromCloudinary } from '../../utils/deleteFile.js';


export const updateMemberProfile = async (req, res) => {
  try {
    const memberId = req.user;
    const updates = req.body;
    const files = req.uploadedFiles || {};

    const member = await RedanMember.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    console.log('🔍 Incoming profile update from:', member);
    console.log('🧾 Request Body Fields:', updates);
    console.log('📎 Uploaded Files Received:', Object.keys(files));

    // === 1. PROFILE PHOTO ===
    if (files.profilePhoto?.[0]) {
      if (member.profilePhotoPublicId) {
        await deleteFromCloudinary(member.profilePhotoPublicId);
      }
      updates.profilePhotoUrl = files.profilePhoto[0].path;
      updates.profilePhotoPublicId = files.profilePhoto[0].filename;

      console.log('✅ Profile photo uploaded:', updates.profilePhotoUrl);
    }

    // === 2. COMPANY LOGO ===
    if (files.companyLogo?.[0]) {
      if (member.companyLogoPublicId) {
        await deleteFromCloudinary(member.companyLogoPublicId);
      }
      updates.companyLogoUrl = files.companyLogo[0].path;
      updates.companyLogoPublicId = files.companyLogo[0].filename;

      console.log('✅ Company logo uploaded:', updates.companyLogoUrl);
    }

    // === 3. DOCUMENTS ===
    const docFields = ['identificationDoc', 'taxClearance', 'cacCertificate', 'businessPermit'];
    for (const field of docFields) {
      if (files[field]?.[0]) {
        const newUrl = files[field][0].path;
        const newPublicId = files[field][0].filename;

        const existingPublicId = member.documents?.[`${field}PublicId`];
        if (existingPublicId) {
          await deleteFromCloudinary(existingPublicId);
        }

        updates[`documents.${field}Url`] = newUrl;
        updates[`documents.${field}PublicId`] = newPublicId;

        console.log(`✅ ${field} uploaded: ${newUrl}`);
      }
    }

    // === 4. SUPPORTING DOCUMENTS (Multiple Uploads) ===
    if (files.supportDocs?.length > 0) {
      const uploadedSupportDocs = files.supportDocs.map(doc => ({
        url: doc.path,
        publicId: doc.filename,
      }));

      // If you want to replace old docs:
      if (member.supportDocs?.length > 0) {
        const oldIds = member.supportDocs.map(doc => doc.publicId);
        await deleteFromCloudinary(oldIds);
      }

      updates.supportDocs = uploadedSupportDocs;

      console.log(`✅ ${uploadedSupportDocs.length} support docs uploaded`);
    }

    // === 5. SAFELY APPLY UPDATES ===
    for (const key in updates) {
      if (
        updates[key] !== undefined &&
        updates[key] !== null &&
        updates[key] !== '' &&
        key !== '_id'
      ) {
        // Dot-notation update (like documents.taxClearanceUrl)
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          member[parent] = {
            ...member[parent],
            [child]: updates[key],
          };
        } else {
          member[key] = updates[key];
        }
      }
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profileCompletion: `${member.profileCompletion}%`,
      sectionCompletion: member.completionSections,
      data: {
        fullName: member.fullName,
        companyName: member.companyName,
        email: member.email,
        phoneNumber: member.phoneNumber,
        profilePhotoUrl: member.profilePhotoUrl,
        companyLogoUrl: member.companyLogoUrl,
        address: member.address,
        dob: member.dob,
        state: member.state,
        lga: member.lga,
        rcNumber: member.rcNumber,
        nin: member.nin,
        identificationType: member.identificationType,
        about: member.about,
        documents: member.documents,
        supportDocs: member.supportDocs,
      },
    });
  } catch (err) {
    console.error('❌ Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: err.message,
    });
  }
};


export const getLoggedInUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userData = req.user.toObject(); // convert from Mongoose doc
    delete userData.password;
    delete userData.verificationCode;

    res.status(200).json({
      success: true,
      role: req.userType, // 'member' or one of the ADMIN_ROLES
      data: userData,
    });
  } catch (err) {
    console.error("Error fetching logged-in user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
