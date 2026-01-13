import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id") || "";
    const svixTimestamp = headerPayload.get("svix-timestamp") || "";
    const svixSignature = headerPayload.get("svix-signature") || "";

    // Create webhook instance
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

    let evt;
    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }

    // Handle user.created event
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail =
        email_addresses.find(
          (email: any) => email.id === evt.data.primary_email_address_id
        )?.email_address || email_addresses[0]?.email_address;

      if (!primaryEmail) {
        console.error("No email address found for user:", id);
        return new Response("No email address found", { status: 400 });
      }

      try {
        // Create user in database
        const user = await prisma.user.create({
          data: {
            clerkId: id,
            email: primaryEmail,
            firstName: first_name || "",
            lastName: last_name || "",
            avatarUrl: image_url || null,
          },
        });

        console.log("User created:", user.id, primaryEmail);
        return new Response(JSON.stringify({ success: true, userId: user.id }), {
          status: 200,
        });
      } catch (err: any) {
        // Handle unique constraint error if user already exists
        if (err.code === "P2002") {
          console.warn("User already exists:", primaryEmail);
          return new Response(
            JSON.stringify({ success: true, message: "User already exists" }),
            { status: 200 }
          );
        }
        console.error("Error creating user:", err);
        return new Response("Error creating user", { status: 500 });
      }
    }

    // Handle user.updated event
    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail =
        email_addresses.find(
          (email: any) => email.id === evt.data.primary_email_address_id
        )?.email_address || email_addresses[0]?.email_address;

      try {
        // Update user in database
        const user = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            firstName: first_name || "",
            lastName: last_name || "",
            avatarUrl: image_url || null,
          },
        });

        console.log("User updated:", user.id);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } catch (err: any) {
        if (err.code === "P2025") {
          // User not found - create it
          try {
            const user = await prisma.user.create({
              data: {
                clerkId: id,
                email: primaryEmail,
                firstName: first_name || "",
                lastName: last_name || "",
                avatarUrl: image_url || null,
              },
            });
            console.log("User created from update event:", user.id);
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
            });
          } catch (createErr) {
            console.error("Error creating user from update:", createErr);
            return new Response("Error creating user", { status: 500 });
          }
        }
        console.error("Error updating user:", err);
        return new Response("Error updating user", { status: 500 });
      }
    }

    // Handle user.deleted event (optional cleanup)
    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      try {
        await prisma.user.delete({
          where: { clerkId: id },
        });
        console.log("User deleted:", id);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } catch (err: any) {
        if (err.code === "P2025") {
          // User doesn't exist in database
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
          });
        }
        console.error("Error deleting user:", err);
        return new Response("Error deleting user", { status: 500 });
      }
    }

    // Return success for other event types
    return new Response(
      JSON.stringify({ success: true, eventType: evt.type }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook processing error", { status: 500 });
  }
}
