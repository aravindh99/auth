import prisma from '../config/prismaClient.js';

export const checkOrganizationExists = async (organizationId) => {
  if (!organizationId) return false;
  
  const organization = await prisma.organization.findUnique({
    where: { id: parseInt(organizationId) }
  });
  
  return !!organization;
};

export const checkUserBelongsToOrganization = async (userId, organizationId) => {
  if (!userId || !organizationId) return false;
  
  const user = await prisma.user.findFirst({
    where: {
      id: parseInt(userId),
      organizationId: parseInt(organizationId)
    }
  });
  
  return !!user;
};

export const checkProjectExists = async (projectId, organizationId = null) => {
  if (!projectId) return false;
  
  const whereClause = { id: parseInt(projectId) };
  if (organizationId) {
    whereClause.organizationId = parseInt(organizationId);
  }
  
  const project = await prisma.project.findFirst({
    where: whereClause
  });
  
  return !!project;
};

export const getUserPermissions = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      organization: true,
      projects: {
        include: {
          project: true
        }
      }
    }
  });
  
  if (!user) return null;
  
  return {
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization?.name,
    projects: user.projects.map(up => ({
      projectId: up.project.id,
      projectName: up.project.name,
      role: up.role
    }))
  };
};

export const isUserAuthorizedForProject = async (userId, projectId, requiredRole = 'VIEWER') => {
  const userProject = await prisma.userProject.findFirst({
    where: {
      userId: parseInt(userId),
      projectId: parseInt(projectId)
    }
  });
  
  if (!userProject) return false;
  
  const roleHierarchy = ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'];
  const userRoleIndex = roleHierarchy.indexOf(userProject.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};