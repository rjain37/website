import React from "react";
import Link from "next/link";
import nowPlaying from "@/components/NowPlaying";

const Footer = () => {
	return (
		<footer className="bg-dark-100 dark:bg-black">
			<div className="max-w-6xl mx-auto px-4 sm:px-6">
				<div className="py-8 md:flex md:items-center md:justify-between">
					<div className="mt-8 md:mt-0 md:order-1">
						<p className="text-center text-base text-dark-700 dark:text-gray-50">
							&copy; 2023 Rohan Jain. All rights reserved. 
							{/* {nowPlaying()} */}
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;