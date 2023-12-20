import emailjs from "@emailjs/browser";

const sendEmail = async (data) => {
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICEID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATEID,
      {
        reply_to: data.email,
        organisation_name: data.organisationName,
        from_name: data.name,
        signup: "http://localhost:3000/auth/signup",
        role: data.role,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLICKEY
    );
    return `the user with email id ${data.email} doesnt have an account we sent an email to create an account`;
  } catch (e) {
    return `invaid email : ${data.email}`;
  }
};

export default sendEmail;
