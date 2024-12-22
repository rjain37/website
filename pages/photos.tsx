import { useEffect, useState } from 'react';
import PageLayout from "@/layouts/PageLayout";
import useColorMode from "@/hooks/useColorMode";
import colorModes from "@/utils/colorModes";
import Image from "next/image";
import PhotoModal from "@/components/PhotoModal";
import fs from 'fs';
import path from 'path';

interface PhotoProps {
  photos: string[];
}

const Photos = ({ photos }: PhotoProps) => {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === colorModes.dark;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <PageLayout>
      <div className={"mx-auto w-full max-w-6xl"}>
        <h1 className={"pt-12 text-4xl font-semibold"}>
          <code>ls /Photos</code>
        </h1>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPhoto(`/photos/${photo}`)}
            >
              <Image
                src={`/photos/${photo}`}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {selectedPhoto && (
          <PhotoModal
            isOpen={!!selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            photoSrc={selectedPhoto}
          />
        )}
      </div>
    </PageLayout>
  );
};

export async function getStaticProps() {
  const photosDirectory = path.join(process.cwd(), 'public/photos');
  const photoFiles = fs.readdirSync(photosDirectory);

  return {
    props: {
      photos: photoFiles,
    },
  };
}

export default Photos;
