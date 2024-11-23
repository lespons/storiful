'use client';
import { ChangeEvent, useState } from 'react';
import { PUBLIC_CLOUDINARY_CLOUD } from '@/lib/cloudinary';
import { PaperClipIcon } from '@heroicons/react/24/outline';

const FileSelector = ({
  onChange,
  initValue
}: {
  onChange: (url: string) => void;
  initValue?: string | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(initValue);

  const uploadImage = async (files: FileList) => {
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'storiful'); // Replace with your Cloudinary upload preset
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${PUBLIC_CLOUDINARY_CLOUD}/image/upload`, // Replace with your Cloudinary URL
        {
          method: 'POST',
          body: data
        }
      );
      const result = await response.json();
      onChange(result.secure_url);
      setUrl(result.secure_url);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    uploadImage(event.target.files!);
  };

  return (
    <div className="image-upload w-full mb-2">
      <input id="file" type="file" name="file" onChange={handleChange} className="hidden w-full" />

      <label
        htmlFor="file"
        className={
          'group flex gap-2 w-full justify-center px-2 py-1 rounded-md bg-blue-200 hover:bg-blue-300 hover:cursor-pointer font-semibold'
        }>
        attach file
        <PaperClipIcon className={'size-4 my-auto group-hover:animate-shake'} />
      </label>
      {loading && <p>uploading...</p>}
      {url && (
        <div className={'rounded-md my-2 overflow-hidden'}>
          <img src={url} alt="Uploaded" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default FileSelector;
