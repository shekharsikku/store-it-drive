import Link from "next/link";
import type { Models } from "node-appwrite";
import { ActionDropdown } from "@/components/action-dropdown";
import { FormattedDateTime } from "@/components/formatted-datetime";
import { Thumbnail } from "@/components/thumbnail";
import { convertFileSize } from "@/lib/utils";

const Card = ({ file }: { file: Models.Document }) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="size-20!"
          imageClassName="size-11!"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details min-w-0">
        <p className="subtitle-2 line-clamp-1 truncate">{file.name}</p>
        <FormattedDateTime date={file.$createdAt} className="body-2 text-light-100" />
        <p className="caption line-clamp-1 text-light-200">By: {file.owner.fullName}</p>
      </div>
    </Link>
  );
};

export { Card };
