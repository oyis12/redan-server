export const calculateProfileProgress = (memberDoc) => {
  const doc = memberDoc.toObject();

  const sectionFields = {
    personal: ['fullName', 'email', 'phoneNumber', 'dob', 'address', 'state', 'lga', 'nin', 'identificationType'],
    company: ['companyName', 'rcNumber', 'about', 'profilePhotoUrl', 'companyLogoUrl'],
    documents: ['identificationDocUrl', 'taxClearanceUrl', 'cacCertificateUrl', 'businessPermitUrl']
  };

  const sections = {
    personal: 0,
    company: 0,
    documents: 0
  };

  let totalFields = 0;
  let totalFilled = 0;

  for (const [section, fields] of Object.entries(sectionFields)) {
    let filled = 0;
    fields.forEach((key) => {
      const val = doc[key];
      const isFilled = val !== undefined && val !== null && (typeof val !== 'string' || val.trim() !== '');
      if (isFilled) filled++;
    });

    sections[section] = Math.round((filled / fields.length) * 100);
    totalFields += fields.length;
    totalFilled += filled;
  }

  const total = Math.round((totalFilled / totalFields) * 100);
  return { total, sections };
};
