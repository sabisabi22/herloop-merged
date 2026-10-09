import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { parentEmail, teenName, approvalToken } =
      await request.json();

    if (!parentEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Parent email is required",
        },
        { status: 400 }
      );
    }

    if (!approvalToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Approval token is required",
        },
        { status: 400 }
      );
    }

    const approvalUrl =
      `http://localhost:3000/approve?token=${approvalToken}`;

    const { data, error } = await resend.emails.send({
      from: "HerLoop <onboarding@resend.dev>",
      to: parentEmail,
      subject: "HerLoop Parent Approval Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">

          <h2>HerLoop Parent Approval</h2>

          <p>Hello,</p>

          <p>
            ${teenName || "A teen"} has requested
            parent/guardian approval to use HerLoop.
          </p>

          <p>
            Please review the request and approve it using the button below.
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${approvalUrl}"
              style="
                background-color: #7a315d;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
              "
            >
              Approve HerLoop Request
            </a>
          </p>

          <p>
            If you did not expect this request, you can ignore this email.
          </p>

          <p>
            Thank you,<br />
            HerLoop Team
          </p>

        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Email could not be sent",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Parent email sent",
      id: data?.id,
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}