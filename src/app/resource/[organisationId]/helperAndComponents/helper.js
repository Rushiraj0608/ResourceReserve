const stringCheck = (str) => {
  let result = { validity: 0, data: str };
  if (!str) {
    result.data = `cannot be empty`;
    return result;
  }
  if (typeof str != "string") {
    result.data = `invalid format`;
    return result;
  }
  str = str.trim();
  if (str.length < 3) {
    result.data = `number of characters cannot be less than 3`;
    return result;
  }
  result.data = str;
  result.validity = 1;
  return result;
};

const numberCheck = (num) => {
  let result = { validity: 0, data: num };
  if (!num) {
    result.data = `cannot be empty`;
    return result;
  }
  num = parseInt(num);
  if (!num) {
    result.data = `cannot be empty`;
    return result;
  }
  if (typeof num != "number") {
    result.data = `invalid format`;
    return result;
  }
  if (num == NaN) {
    result.data = `number cannot be Nan`;
    return result;
  }
  if (num < 1) {
    result.data = `number cannot be less than 1`;
    return result;
  }
  result.data = num;
  result.validity = 1;
  return result;
};

const nameCheck = (name, varname) => {
  let { data, validity } = stringCheck(name);
  if (!validity) return { data: ` ${varname} ${data}`, validity: 0 };
  if (data.length > 40)
    return {
      data: `${varname} length must be inbetween 3 and 40`,
      validity: 0,
    };
  data = data.toLowerCase();
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (format.test(data))
    return {
      data: `${varname} cannot contain any special characters`,
      validity: 0,
    };
  return { validity: 1, data };
};
const rulesCheck = (name, varname) => {
  let { data, validity } = stringCheck(name);
  if (!validity) return { data: `${varname} ${data}`, validity: 0 };
  data = data.toLowerCase();
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (format.test(data))
    return {
      data: `${varname} cannot contain any special characters`,
      validity: 0,
    };
  return { validity: 1, data };
};
const capacityCheck = (capacity) => {
  let { data, validity } = numberCheck(capacity);
  console.log(data);
  if (!validity) return { data: `capacity ${data}`, validity: 0 };
  if (data > 100 || data < 1)
    return { data: "capacity can be in between 1 and 100", validity: 0 };
  return { validity: 1, data };
};

const emailCheck = (email) => {
  let { data, validity } = stringCheck(email);
  if (!validity) return { data: `Email ${data}`, validity: 0 };
  var re = /\S+@\S+\.\S+/;
  if (!re.test(data)) return { validity: 0, data: `invalid email` };
  data = data.toLowerCase();
  return { validity: 1, data };
};

const contactCheck = (contact) => {
  let { data, validity } = numberCheck(contact);
  if (!validity) return { data: `contact ${data}`, validity: 0 };
  let len = `${data}`.length;
  if (len != 10)
    return { data: "phone number must have 10 digits", validity: 0 };
  return { data, validity: 1 };
};

const createResourceCheck = (resource) => {
  let errors = {};
  let validity = 1;
  let resultResource = {};
  let exclude = [
    "images",
    "permission",
    "schedule",
    "tags",
    "organisationId",
    "state",
    "managedBy",
  ];

  if (resource.description)
    resource.description = rulesCheck(resource.description, "description");
  if (resource.rules) resource.rules = rulesCheck(resource.rules, "rules");
  if (resource.name)
    resource.name = nameCheck(resource.name, "Name of the Resource");
  if (resource.type) resource.type = nameCheck(resource.type, "type");
  if (resource.address1)
    resource.address1 = nameCheck(resource.address1, "address1");
  if (resource.address2)
    resource.address2 = nameCheck(resource.address2, "address2");
  if (resource.city) resource.city = nameCheck(resource.city, "city");
  if (resource.contact) resource.contact = contactCheck(resource.contact);
  if (resource.email) resource.email = emailCheck(resource.email);
  if (resource.capacity) resource.capacity = capacityCheck(resource.capacity);
  if (resource.reservationGap)
    resource.reservationGap = numberCheck(resource.reservationGap);
  if (resource.reservationLength)
    resource.reservationLength = numberCheck(resource.reservationLength);
  if (resource.schedule) {
    if (Object.values(resource.schedule).flat(Infinity).length < 3) {
      validity = 0;
      errors.schedule = "the resource must be available atleast for two days";
    }
  }
  if (resource.state.length < 2) {
    validity = 0;
    errors.state = "select a state";
  }
  if (resource.managedBy.length < 1) {
    validity = 0;
    errors.managedBy = "there must be atleast one manager to add the resource";
  }
  if (resource.tags.length < 1) {
    validity = 0;
    errors.tags = "there must be atleast one tag to  resource";
  }

  for (let key in resource) {
    if (exclude.includes(key)) {
      resultResource[key] = resource[key];
    } else if (resource[key].validity) {
      resultResource[key] = resource[key].data;
    } else if (resource[key].data && !resource[key].validity) {
      validity = 0;
      errors[key] = resource[key].data;
    }
  }
  resultResource.state = resource.state;

  return { validity, resource: resultResource, errors };
};

const formDataCheck = (resource) => {
  let errors = {};
  let resultResource = {};
  let validity = 1;
  let exclude = [
    "images",
    "permission",
    "schedule",
    "tags",
    "organisationId",
    "state",
    "managedBy",
  ];

  resource.description = rulesCheck(resource.description, "description");
  resource.rules = rulesCheck(resource.rules, "rules");
  resource.name = nameCheck(resource.name, "Name of the Resource");
  resource.type = nameCheck(resource.type, "type");
  resource.address1 = nameCheck(resource.address1, "address1");
  resource.address2 = nameCheck(resource.address2, "address2");
  resource.city = nameCheck(resource.city, "city");
  resource.contact = contactCheck(resource.contact);
  resource.email = emailCheck(resource.email);
  resource.capacity = capacityCheck(resource.capacity);
  if (resource.state.length < 2) {
    validity = 0;
    errors.state = "select a state";
  }
  if (resource.managedBy.length < 1) {
    validity = 0;
    errors.managedBy = "there must be atleast one manager to add the resource";
  }
  if (resource.tags.length < 1) {
    validity = 0;
    errors.tags = "there must be atleast one tag";
  }

  if (resource.reservationGap)
    resource.reservationGap = numberCheck(resource.reservationGap);
  if (resource.reservationLength)
    resource.reservationLength = numberCheck(resource.reservationLength);

  for (let key in resource) {
    if (exclude.includes(key)) {
      resultResource[key] = resource[key];
    } else if (resource[key].validity) {
      resultResource[key] = resource[key].data;
    } else if (resource[key].data && !resource[key].validity) {
      validity = 0;
      errors[key] = resource[key].data;
    }
  }
  console.log(resultResource, "right before returning");
  return { validity, resource: resultResource, errors };
};

const createOrganisationCheck = (organisation) => {
  let errors = {};
  let checkedOrganisation = {};

  if (!organisation.name.length > 0)
    errors = { ...errors, name: "organisation name cannot be empty" };
  else {
    let { validity, data } = nameCheck(organisation.name, "organisation name");
    if (!validity) {
      errors = { ...errors, name: data };
    } else {
      checkedOrganisation.name = data;
    }
  }
  if (!organisation.email.length > 0)
    errors = { ...errors, email: "organisation email cannot be empty" };
  else {
    let { validity, data } = emailCheck(organisation.email);
    if (!validity) {
      errors = { ...errors, email: data };
    } else {
      checkedOrganisation.email = data;
    }
  }
  if (!organisation.contact.length > 0)
    errors = { ...errors, contact: "organisation contact cannot be empty" };
  else {
    let { validity, data } = contactCheck(
      organisation.contact,
      "organisation name"
    );
    if (!validity) {
      errors = { ...errors, contact: data };
    } else {
      checkedOrganisation.contact = data;
    }
  }
  if (organisation.admins.length < 1) {
    errors = {
      ...errors,
      admins: "There must be atleast one admin to create a resource",
    };
  }
  if (organisation.admins.length > 0) {
    organisation.admins.map((admin) => {
      if (admin.email == organisation.email) {
        errors = {
          ...errors,
          admins: "admin email must not be the same as the organisation",
        };
      }
    });
  }
  checkedOrganisation.admins = [...organisation.admins];
  if (Object.values(errors).toString().length > 0)
    return { validity: 0, data: errors };
  else {
    return { validity: 1, data: checkedOrganisation };
  }
};

const editOrganisationCheck = (organisation) => {
  let errors = {};
  let checkedOrganisation = {};
  console.log(organisation);
  if (!organisation.name.length > 0)
    errors = { ...errors, name: "organisation name cannot be empty" };
  else {
    let { validity, data } = nameCheck(organisation.name, "organisation name");
    if (!validity) {
      errors = { ...errors, name: data };
    } else {
      checkedOrganisation.name = data;
    }
  }
  if (!organisation.email.length > 0)
    errors = { ...errors, email: "organisation email cannot be empty" };
  else {
    let { validity, data } = emailCheck(organisation.email);
    if (!validity) {
      errors = { ...errors, email: data };
    } else {
      checkedOrganisation.email = data;
    }
  }
  if (!`${organisation.contact}`.length > 0)
    errors = { ...errors, contact: "organisation contact cannot be empty" };
  else {
    let { validity, data } = contactCheck(
      organisation.contact,
      "organisation name"
    );
    if (!validity) {
      errors = { ...errors, contact: data };
    } else {
      checkedOrganisation.contact = data;
    }
  }

  if (organisation.admins.length > 0) {
    organisation.admins.map((admin) => {
      if (admin.email == organisation.email) {
        errors = {
          ...errors,
          admin: "admin email must not be the same as the organisation",
        };
      }
    });
  }
  if (Object.values(errors).toString().length > 0) {
    return { validity: 0, data: errors };
  } else {
    checkedOrganisation.admins = [...organisation.admins];
    return { validity: 1, data: checkedOrganisation };
  }
};
export {
  createResourceCheck,
  nameCheck,
  capacityCheck,
  emailCheck,
  contactCheck,
  rulesCheck,
  formDataCheck,
  createOrganisationCheck,
  editOrganisationCheck,
};
