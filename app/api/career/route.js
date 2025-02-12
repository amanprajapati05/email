
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const file = formData.get('resume');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

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

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const isImage = file.type.startsWith('image/');
    const fileDescription = isImage ? 'Photo ID/Image' : 'Resume';

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: process.env.EMAIL_ID,
      replyTo: email,
      subject: `New Job Application from ${name}`,
      html: `
        <div>
          <h2>New Job Application</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Uploaded ${fileDescription}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: file.name,
          content: buffer
        }
      ]
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: "Failed to send message", error: error.message },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
