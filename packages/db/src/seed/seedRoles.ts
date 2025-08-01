import { RoleStatus, RoleType } from '@prisma/client';
import { prismaClient } from '..';

 

export async function seedRoles() {
  const roles = [
    {
      name: "BMSP_SUPER_ADMIN",
      type: RoleType.BMSP_SUPER_ADMIN,
      description: "Super admin with full control over the platform.",
      isCustom: false,
    },
    {
      name: "BMSP_ADMIN",
      type: RoleType.BMSP_ADMIN,
      description: "Admin with full control except direct financial views.",
      isCustom: false,
    },
    {
      name: "BMSP_FINANCE_ADMIN",
      type: RoleType.BMSP_FINANCE_ADMIN,
      description: "Finance admin limited to managing financial data and read-only ground details.",
      isCustom: false,
    },
    {
      name: "BMSP_VENUES_ADMIN",
      type: RoleType.BMSP_VENUES_ADMIN,
      description: "Ground admin with full control over all grounds and ground-level admins.",
      isCustom: false,
    },
    {
      name: "BMSP_REGIONAL_VENUES_ADMIN",
      type: RoleType.BMSP_REGIONAL_VENUES_ADMIN,
      description: "Regional ground admin responsible for verifying grounds within designated regions.",
      isCustom: false,
    },
    {
      name: "BMSP_BOOKINGS_ADMIN",
      type: RoleType.BMSP_BOOKINGS_ADMIN,
      description: "Booking admin for managing booking requests.",
      isCustom: false,
    },
    {
      name: "BMSP_CUSTOMER_CARE",
      type: RoleType.BMSP_CUSTOMER_CARE,
      description: "Customer care admin for handling booking inquiries and user support.",
      isCustom: false,
    },
    {
      name: "VENUE_OWNER",
      type: RoleType.VENUE_OWNER,
      description: "Primary ground owner with full control over their ground.",
      isCustom: false,
    },
    {
      name: "ADDITIONAL_VENUE_MANAGER",
      type: RoleType.SECONDARY_VENUE_NAME_MANAGER,
      description: "Senior ground manager with full authority over ground operations.",
      isCustom: false,
    },
    {
      name: "VENUE_OPERATIONS_MANAGER",
      type: RoleType.VENUE_OPERATIONS_MANAGER,
      description: " venue manager responsible for day-to-day operations.",
      isCustom: false,
    },
    {
      name: "VENUE_BOOKING_MANAGER",
      type: RoleType.VENUE_BOOKING_MANAGER,
      description: "Booking manager handling venue-specific booking operations.",
      isCustom: false,
    },
    {
      name: "USER",
      type: RoleType.USER,
      description: "Regular user with limited access to view and book grounds.",
      isCustom: false,
    },
    {name:"SYSTEM",
      
       type: RoleType.SYSTEM,
         description: 'Internal system processes and automated tasks.',
        isCustom:false }, // <-- NEW
        {
          name: 'ANONYMOUS',
           type: RoleType.ANONYMOUS,
        description: 'For unauthenticated actions and guest users.',
        isCustom: false,
      }, // <-- NEW
  ];

  for (const role of roles) {
    await prismaClient.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        type: role.type,
        description: role.description,
        isCustom: role.isCustom,
        status: RoleStatus.ACTIVE,
      },
    });
  }
  console.log("Roles seeded successfully.");
}
