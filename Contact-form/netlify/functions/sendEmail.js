const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


exports.handler = async (event) => {
    console.log("Incoming request: ", event);
  
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }
  
    try {
      const { name, email, message } = JSON.parse(event.body);
      console.log("Parsed body:", { name, email, message });
  
      if (!name || !email || !message) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'All fields are required.' })
        };
      }
  
      const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_USER_ID,
          template_params: {
            name,
            email,
            message
          }
        })
      });
  
      const result = await emailJsResponse.text();
      console.log("EmailJS response:", result);
  
      if (!emailJsResponse.ok) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Failed to send email', error: result })
        };
      }
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Message sent successfully!' })
      };
  
    } catch (err) {
      console.error("Error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Server error', error: err.message })
      };
    }
  };
  
