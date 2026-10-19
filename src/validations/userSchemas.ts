import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }).optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }).optional(),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  bio: z.string().max(250, { message: "Bio cannot exceed 250 characters" }).optional(),
  imageUrl: z.string().url({ message: "Invalid image URL format" }).optional(),
  nextOfKinName: z.string().min(2, { message: "Next of kin name required" }).optional(),
  nextOfKinRelationship: z.string().min(2, { message: "Relationship required" }).optional(),
  nextOfKinPhone: z.string().min(10, { message: "Valid phone required" }).optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const pinSchema = z.object({
  pin: z
    .string()
    .length(4, { message: "PIN must be exactly 4 digits" })
    .regex(/^\d+$/, { message: "PIN must contain numbers only" }),
});

export type PinFormData = z.infer<typeof pinSchema>;

export const updatePinSchema = z
  .object({
    oldPin: z
      .string()
      .length(4, { message: "Current PIN must be exactly 4 digits" })
      .regex(/^\d+$/, { message: "PIN must contain numbers only" }),
    newPin: z
      .string()
      .length(4, { message: "New PIN must be exactly 4 digits" })
      .regex(/^\d+$/, { message: "PIN must contain numbers only" }),
    confirmPin: z.string().length(4, { message: "Confirm PIN must be exactly 4 digits" }),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "New PIN and confirmation do not match",
    path: ["confirmPin"],
  });

export type UpdatePinFormData = z.infer<typeof updatePinSchema>;

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
