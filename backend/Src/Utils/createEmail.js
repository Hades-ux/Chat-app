const createEmail = ({ subject, title, message, buttonText, link, expiry }) => ({
  subject: { subject },
  html: `
    <h2>${title}</h2>
    <p>${message}</p>
    <a href="${link}">${buttonText}</a>
    <p>${expiry}</p>
    `,
});

export default createEmail;