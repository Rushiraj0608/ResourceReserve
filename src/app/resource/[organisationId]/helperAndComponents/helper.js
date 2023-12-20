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
    result.data = `cannot be less than`;
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

const formDataCheck = (resource) => {
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
  resource.reservationGap = numberCheck(resource.reservationGap);
  resource.reservationLength = numberCheck(resource.reservationLength);

  return resource;
};
export {
  nameCheck,
  capacityCheck,
  emailCheck,
  contactCheck,
  rulesCheck,
  formDataCheck,
};
