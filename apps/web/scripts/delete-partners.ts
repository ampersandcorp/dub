import { prisma } from "@dub/prisma";
import "dotenv-flow/config";
import { bulkDeleteLinks } from "../lib/api/links/bulk-delete-links";

async function main() {
  const partner = await prisma.partner.findUniqueOrThrow({
    where: {
      id: "pn_d43H73P1HU58aDq7Ty30qFyW",
    },
    include: {
      programs: {
        select: {
          links: true,
        },
      },
    },
  });

  const programEnrollment = partner.programs[0];
  const links = programEnrollment.links;

  const deleteLinkCaches = await bulkDeleteLinks(links);
  console.log("Deleted link caches", deleteLinkCaches);

  const deleteCustomers = await prisma.customer.deleteMany({
    where: {
      linkId: {
        in: links.map((link) => link.id),
      },
    },
  });
  console.log("Deleted customers", deleteCustomers);

  const deleteLinks = await prisma.link.deleteMany({
    where: {
      id: {
        in: links.map((link) => link.id),
      },
    },
  });
  console.log("Deleted links", deleteLinks);

  const deleteSales = await prisma.commission.deleteMany({
    where: {
      partnerId: partner.id,
    },
  });
  console.log("Deleted sales", deleteSales);

  const deletePayouts = await prisma.payout.deleteMany({
    where: {
      partnerId: partner.id,
    },
  });
  console.log("Deleted payouts", deletePayouts);

  const deletePartner = await prisma.partner.delete({
    where: {
      id: partner.id,
    },
  });
  console.log("Deleted partner", deletePartner);
}

main();
