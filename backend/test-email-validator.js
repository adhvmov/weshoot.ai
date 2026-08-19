const { isDisposableEmail } = require('./src/utils/emailValidator');

const testEmails = [
    'realuser@gmail.com',
    'test@outlook.com',
    'malicious@mailinator.com',
    'scammer@10minutemail.com',
    'user@sharklasers.com',
    'person@yahoo.com',
    'bot@temp-mail.org'
];

console.log('--- Testing Burner Email Detection ---');
testEmails.forEach(email => {
    const isDisposable = isDisposableEmail(email);
    console.log(`${email.padEnd(30)} | ${isDisposable ? 'BLOCKED' : 'ALLOWED'}`);
});
console.log('--------------------------------------');
