/* eslint-disable react-hooks/exhaustive-deps */
/*
	This container...
	- checks if we have a Cloudinary upload for given hash
		- if yes, send the Cloudinary URL to the media component
		- if no, send the IPFS URL to the media component
*/

// React Imports
import React, { useState, useEffect } from 'react';

// Type Imports
import { MediaContainerProps } from './types';

// Style Imports
import styles from './NFTMedia.module.scss';

// Component Imports
import { Overlay, Spinner } from 'components';
import IPFSMedia from './IPFSMedia';
import CloudinaryMedia from './CloudinaryMedia';

// Library Imports
import classNames from 'classnames/bind';
import { getHashFromIPFSUrl } from 'lib/ipfs';
import { checkMediaType, MediaType } from './config';
import { DEFAULT_IPFS_GATEWAY } from 'constants/ipfs';

const cx = classNames.bind(styles);

const NFTMediaContainer: React.FC<MediaContainerProps> = ({
	alt,
	className,
	disableLightbox,
	fit,
	ipfsUrl,
	size,
	style,
}) => {
	//////////////////
	// State & Data //
	//////////////////

	// Handling lightbox open/close
	const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

	const [hasCloudinaryFailed, setHasCloudinaryFailed] =
		useState<boolean>(false);

	// Media details
	const [isMediaLoading, setIsMediaLoading] = useState<boolean>(true);
	const [mediaLocation, setMediaLocation] = useState<string | undefined>();
	const [mediaType, setMediaType] = useState<MediaType | undefined>();

	///////////////
	// Functions //
	///////////////

	// Sets internal "media loading" state
	// when media loads - this is passed down
	// to the image or video components
	const onLoadMedia = () => {
		setIsMediaLoading(false);
	};

	const onCloudinaryFailed = () => {
		console.warn('Failed to find Cloudinary link for asset ' + ipfsUrl);
		setHasCloudinaryFailed(true);
	};

	// Toggles internal lightbox state object
	// i.e. shows/hides lightbox
	const toggleLightbox = () => {
		if (!disableLightbox) {
			setIsLightboxOpen(!isLightboxOpen);
		}
	};

	/////////////
	// Effects //
	/////////////

	// Gets all media data when IPFS url changes
	// @todo clean this up
	useEffect(() => {
		let isMounted = true;

		setIsMediaLoading(true);
		setMediaLocation(undefined);
		setMediaType(undefined);
		setHasCloudinaryFailed(false);

		if (!ipfsUrl || !ipfsUrl.length) {
			// By returning nothing here this container
			// will just render the Spinner component
			// @todo render an error icon/message
			return;
		}

		const hash = getHashFromIPFSUrl(ipfsUrl);
		checkMediaType(hash).then((t) => {
			if (isMounted) {
				setMediaType(t as MediaType);
				setMediaLocation(hash);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [ipfsUrl]);

	///////////////
	// Fragments //
	///////////////

	// React fragment for the media component
	// @params matchSize - true if we should respect the size prop
	// useful for showing full-res version lightbox
	const mediaComponent = (
		matchSize: boolean,
		style: React.CSSProperties | undefined,
	) => {
		if (!mediaLocation) {
			return;
		}
		if (!hasCloudinaryFailed) {
			return (
				<CloudinaryMedia
					alt={alt}
					hash={mediaLocation!}
					isPlaying={!isLightboxOpen}
					isVideo={mediaType === MediaType.Video}
					onClick={toggleLightbox}
					onError={onCloudinaryFailed}
					onLoad={onLoadMedia}
					size={matchSize ? size : undefined}
					style={{ ...style, opacity: isMediaLoading ? 0 : 1 }}
					fit={fit}
				/>
			);
		} else {
			return (
				<IPFSMedia
					alt={alt}
					ipfsUrl={DEFAULT_IPFS_GATEWAY + mediaLocation!}
					onClick={toggleLightbox}
					onLoad={onLoadMedia}
					size={matchSize ? size : undefined}
					style={{ ...style, opacity: isMediaLoading ? 0 : 1 }}
				/>
			);
		}
	};

	return (
		<div
			className={cx(className, {
				Container: true,
				Cover: fit === 'cover',
			})}
			style={style}
		>
			{isLightboxOpen && (
				<Overlay centered img open onClose={toggleLightbox}>
					{/* @todo clean up the inline styling below */}
					<div
						className={`${styles.Container}`}
						style={{
							...style,
							borderRadius: 0,
							height: '100%',
							maxHeight: '80vh',
							maxWidth: '80vw',
							objectFit: 'contain',
							position: 'relative',
							textAlign: 'center',
							width: 'auto',
						}}
					>
						{mediaComponent(false, {
							height: '100%',
							maxHeight: '80vh',
							maxWidth: '80vw',
							objectFit: 'contain',
							position: 'relative',
							textAlign: 'center',
							width: 'auto',
						})}
					</div>
				</Overlay>
			)}
			{isMediaLoading && (
				<div className={styles.Spinner}>
					<Spinner />
				</div>
			)}
			{mediaComponent(true, undefined)}
		</div>
	);
};

export default NFTMediaContainer;
