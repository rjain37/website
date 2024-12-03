import { useEffect, useState } from 'react';
import { SiSpotify } from 'react-icons/si';

export default function NowPlaying() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/now-playing');
      const newData = await res.json();
      setData(newData);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!data?.isPlaying) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600 dark:text-gray-400">
        <SiSpotify className="w-5 h-5" />
        <span>Not Playing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <SiSpotify className="w-5 h-5 text-[#1ED760]" />
      <div className="inline-flex items-center space-x-2 sm:space-x-3 max-w-full">
        <a
          className="text-gray-800 dark:text-gray-200 font-medium truncate hover:text-[#1ED760] transition"
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.title}
        </a>
        <span className="text-gray-500 dark:text-gray-400">–</span>
        <span className="text-gray-500 dark:text-gray-400 truncate">
          {data.artist}
        </span>
      </div>
    </div>
  );
}
