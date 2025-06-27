import prisma from '../config/prismaClient.js';

export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const org = await prisma.organization.create({
      data: { name },
    });

    res.status(201).json({ message: "Organization created", organization: org });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create organization", error: err.message });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};
