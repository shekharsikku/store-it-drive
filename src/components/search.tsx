"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { FormattedDateTime } from "@/components/formatted-datetime";
import { Thumbnail } from "@/components/thumbnail";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { type FileDocument, getFiles } from "@/lib/actions/file.actions";

const Search = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchIdRef = useRef(0);

  const [results, setResults] = useState<FileDocument[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchFiles = useDebounce(async (searchText: string, searchId: number) => {
    const files = await getFiles({ types: [], searchText });

    if (searchId !== searchIdRef.current) return;

    setResults(files.rows);
    setQuery(searchText);
    setOpen(true);

    if (files.total === 0) {
      closeTimeoutRef.current = setTimeout(() => {
        if (searchId !== searchIdRef.current) return;

        setOpen(false);
        setQuery("");
        setResults([]);

        router.push(pathname.replace(params.toString(), ""));
        closeTimeoutRef.current = null;
      }, 5000);
    }
  }, 1000);

  const handleSearch = (searchText: string) => {
    const searchId = ++searchIdRef.current;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const trimmed = searchText.trim();

    if (trimmed.length < 3) {
      setOpen(false);
      setResults([]);
      return;
    }

    searchFiles(trimmed, searchId);
  };

  const handleClickItem = (file: FileDocument) => {
    setOpen(false);
    setResults([]);

    router.push(`/${file.type === "video" || file.type === "audio" ? "media" : `${file.type}s`}?query=${query}`);
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image src="/assets/icons/search.svg" alt="Search" width={24} height={24} />
        <Input
          id="search"
          placeholder="Search..."
          className="search-input"
          onChange={(e) => handleSearch(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li className="flex items-center justify-between" key={file.$id} onClick={() => handleClickItem(file)}>
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail type={file.type} extension={file.extension} url={file.url} className="size-9 min-w-9" />
                    <p className="subtitle-2 line-clamp-1 text-light-100">{file.name}</p>
                  </div>

                  <FormattedDateTime date={file.$createdAt} className="caption line-clamp-1 text-light-200" />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export { Search };
