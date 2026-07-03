export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  usersTableId: process.env.NEXT_PUBLIC_APPWRITE_USERS_TABLE!,
  filesTableId: process.env.NEXT_PUBLIC_APPWRITE_FILES_TABLE!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
  secretKey: process.env.NEXT_APPWRITE_SECRET_KEY!,
};
