import RedanMember from '../../models//member.model.js';

export const updateMemberProfile = async (req, res) => {
  try {
    const memberId = req.user; // from auth middleware
    const updates = req.body;

    const member = await RedanMember.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const files = req.uploadedFiles || {}; // populated by uploadMiddleware

    // ⬇️ Handle profile photo upload
    if (files.profilePhoto?.[0]) {
      updates.profilePhotoUrl = files.profilePhoto[0].secure_url;
      updates.profilePhotoPublicId = files.profilePhoto[0].public_id;
    }

    // ⬇️ Handle company logo upload
    if (files.companyLogo?.[0]) {
      updates.companyLogoUrl = files.companyLogo[0].secure_url;
      updates.companyLogoPublicId = files.companyLogo[0].public_id;
    }

    // ⬇️ Handle document uploads
    const docFields = ['identificationDoc', 'taxClearance', 'cacCertificate', 'businessPermit'];
    for (const field of docFields) {
      if (files[field]?.[0]) {
        updates[`${field}Url`] = files[field][0].secure_url;
        updates[`${field}PublicId`] = files[field][0].public_id;
      }
    }

    // ⬇️ Apply all updates
    for (const key in updates) {
      if (updates[key] !== undefined) {
        member[key] = updates[key];
      }
    }

    // ⬇️ Save (triggers pre-save middleware to recalculate profileCompletion)
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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
        documents: {
          identificationDocUrl: member.identificationDocUrl,
          taxClearanceUrl: member.taxClearanceUrl,
          cacCertificateUrl: member.cacCertificateUrl,
          businessPermitUrl: member.businessPermitUrl,
        }
      }
    });

  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
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
