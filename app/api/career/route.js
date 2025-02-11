// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// export async function OPTIONS(request) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//     },
//   });
// }

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const name = formData.get('name');
//     const email = formData.get('email');
//     const phone = formData.get('phone');
//     const file = formData.get('resume');

//     // Rest of your code remains the same...

//     return new NextResponse(JSON.stringify({ message: "Application submitted successfully" }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     });
//   } catch (error) {
//     console.error('Error handling upload:', error);
//     return new NextResponse(JSON.stringify({ message: "Failed to submit application", error: error.message }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     });
//   }
// }
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3001',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:3001',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const file = formData.get('resume');

    // Input validation
    if (!name || !email || !phone || !file) {
      return new NextResponse(
        JSON.stringify({ message: "All fields are required" }), 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ message: "File size exceeds 5MB limit" }), 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Determine file type
    const isImage = file.type.startsWith('image/');
    const fileDescription = isImage ? 'Photo ID/Image' : 'Resume';

    // Prepare and send email
    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: process.env.EMAIL_ID,
      replyTo: email,
      subject: `New Job Application from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #02123b;">New Job Application</h2>
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Uploaded:</strong> ${fileDescription}</p>
          </div>
          <div style="margin-top: 30px; font-size: 14px; color: #666;">
            <p>This is an automated email from your careers form.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: file.name,
          content: buffer,
          contentType: file.type // Include the correct content type
        }
      ]
    });

    // Return success response
    return new NextResponse(
      JSON.stringify({ 
        message: "Application submitted successfully",
        status: "success" 
      }), 
      { 
        status: 200,
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error handling upload:', error);

    // Return error response
    return new NextResponse(
      JSON.stringify({ 
        message: "Failed to submit application", 
        error: error.message,
        status: "error"
      }), 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}