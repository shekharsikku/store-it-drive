"use server";

import { revalidatePath } from "next/cache";
import { ID, type Models, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";

export interface UserDocument extends Models.Document {
  fullName: string;
  email: string;
  avatar: string;
  accountId: string;
}

export interface FileDocument extends Models.Document {
  type: string;
  name: string;
  url: string;
  extension: string;
  size: number;
  owner: UserDocument;
  accountId: string;
  users: string[];
  bucketFileId: string;
}

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
  const { storage, tables } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile({
      bucketId: appwriteConfig.bucketId,
      fileId: ID.unique(),
      file: inputFile,
    });

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await tables
      .createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.filesTableId,
        rowId: ID.unique(),
        data: fileDocument,
      })
      .catch(async (error: unknown) => {
        await storage.deleteFile({ bucketId: appwriteConfig.bucketId, fileId: bucketFile.$id });
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: UserDocument,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.select(["*", "owner.*"]),
    Query.or([Query.equal("owner", currentUser.$id), Query.contains("users", [currentUser.email])]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
  }

  return queries;
};

export const getFiles = async ({ types = [], searchText = "", sort = "$createdAt-desc", limit }: GetFilesProps) => {
  const { tables } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      queries,
    });

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
  const { tables } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await tables.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
      data: { name: newName },
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
  const { tables } = await createAdminClient();

  try {
    const updatedFile = await tables.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
      data: { users: emails },
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({ fileId, bucketFileId, path }: DeleteFileProps) => {
  const { tables, storage } = await createAdminClient();

  try {
    const deletedFile = await tables.deleteRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      rowId: fileId,
    });

    if (deletedFile) {
      await storage.deleteFile({ bucketId: appwriteConfig.bucketId, fileId: bucketFileId });
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

/** Total file space used */
export async function getTotalSpaceUsed() {
  try {
    const { tables } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesTableId,
      queries: [Query.equal("owner", [currentUser.$id])],
    });

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.rows.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (!totalSpace[fileType].latestDate || new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used");
  }
}
