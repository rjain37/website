import { Dialog } from '@headlessui/react';
import Image from 'next/image';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoSrc: string;
}

const PhotoModal = ({ isOpen, onClose, photoSrc }: PhotoModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/75" />
      
      <div className="relative z-50 max-h-[90vh] max-w-[90vw]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          Close
        </button>
        
        <div className="relative h-[80vh] w-[80vw]">
          <Image
            src={photoSrc}
            alt="Enlarged photo"
            fill
            className="object-contain"
            quality={100}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PhotoModal;
