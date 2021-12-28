//- React Imports
import React, { useMemo } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Spring, animated } from 'react-spring';

//- Library Imports
import { formatNumber, formatEthers } from 'lib/utils';

//- Style Imports
import styles from './ZNS.module.scss';

//- Components & Containers
import { StatsWidget } from 'components';

import {
	SubdomainTable,
	CurrentDomainPreview,
	WheelsRaffle,
	BannerContainer,
} from 'containers';

//- Library Imports
import { NFTView, TransferOwnership } from 'containers';
import { useCurrentDomain } from 'lib/providers/CurrentDomainProvider';
import { useZnsSdk } from 'lib/providers/ZnsSdkProvider';
import { DomainMetrics } from '@zero-tech/zns-sdk/lib/types';
import { ethers } from 'ethers';
import useCurrency from 'lib/hooks/useCurrency';
import useMatchMedia from 'lib/hooks/useMatchMedia';
import useScrollDetection from 'lib/hooks/useScrollDetection';

type ZNSProps = {
	domain: string;
	version?: number;
	isNftView?: boolean;
};

enum Modal {
	Bid,
	Mint,
	Transfer,
	Wallet,
}

// @TODO: Rewrite this whole page

const ZNS: React.FC<ZNSProps> = ({ domain, version, isNftView: nftView }) => {
	// TODO: Need to handle domains that don't exist!

	///////////////////
	// Web3 Handling //
	///////////////////
	const sdk = useZnsSdk();
	const { wildPriceUsd } = useCurrency();

	//- Domain Data
	const { domain: znsDomain } = useCurrentDomain();

	////////////////////////
	// Browser Navigation //
	////////////////////////

	const previewCardRef = useRef<HTMLDivElement>(null);

	const isMobile = useMatchMedia('phone');
	const isTabletPortrait = useMatchMedia('(max-width: 768px)');
	const isMobilePortrait = useMatchMedia('(max-width: 520px)');

	//- Page State
	const [hasLoaded, setHasLoaded] = useState(false);
	const [showDomainTable, setShowDomainTable] = useState(true);
	const [isNftView, setIsNftView] = useState(nftView === true);
	const [pageWidth, setPageWidth] = useState<number>(0);
	const [isScrollDetectionDown, setScrollDetectionDown] = useState(false);

	//- Overlay State
	const [modal, setModal] = useState<Modal | undefined>();
	const [tradeData, setTradeData] = useState<DomainMetrics | undefined>();
	const [statsLoaded, setStatsLoaded] = useState(false);

	///////////////
	// Hooks //
	///////////////
	useScrollDetection(setScrollDetectionDown);

	///////////////
	// Functions //
	///////////////

	const scrollToTop = () => {
		document.querySelector('body')?.scrollTo(0, 0);
	};

	/////////////////////
	// Overlay Toggles //
	/////////////////////
	const closeModal = () => {
		setModal(undefined);
	};

	const openTransferOwnershipModal = () => {
		setModal(Modal.Transfer);
	};

	const getTradeData = async () => {
		if (znsDomain) {
			const metricsData = await sdk.instance.getDomainMetrics([znsDomain.id]);
			if (metricsData && metricsData[znsDomain.id]) {
				setTradeData(metricsData[znsDomain.id]);
			}
			setStatsLoaded(true);
		}
	};

	/////////////
	// Effects //
	/////////////

	/* WIP */
	useEffect(() => {
		scrollToTop();
		setShowDomainTable(!isNftView);
	}, [isNftView]);

	/* Also WIP */
	useEffect(() => {
		setIsNftView(nftView === true);
	}, [nftView]);

	useEffect(() => {
		// TODO: Clean this whole hook up
		if (znsDomain) {
			// Set the domain data for table view
			setIsNftView(nftView === true || znsDomain.subdomains.length === 0);
			setHasLoaded(true);
		}
		window.scrollTo({
			top: -1000,
			behavior: 'smooth',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [znsDomain, hasLoaded]);

	useEffect(() => {
		setStatsLoaded(false);
		if (znsDomain && znsDomain.id) {
			getTradeData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [znsDomain]);

	/////////////////////
	// React Fragments //
	/////////////////////

	const nftStats = () => {
		let width = '24.2%';
		if (isMobilePortrait) {
			width = '100%';
		} else if (isTabletPortrait) {
			width = '32%';
		}

		const data = [
			{
				fieldName: 'Items in Domain',
				title: tradeData?.items ? formatNumber(tradeData.items) : 0,
				isHidden: isMobilePortrait,
			},
			{
				fieldName: 'Total Owners',
				title: tradeData?.holders ? formatNumber(tradeData.holders) : 0,
				isHidden: isMobile || isTabletPortrait,
			},
			{
				fieldName: 'Floor Price',
				title: `${
					tradeData?.lowestSale ? formatEthers(tradeData?.lowestSale) : 0
				} WILD`,
				subTitle:
					wildPriceUsd > 0
						? `$${
								tradeData?.lowestSale
									? formatNumber(
											Number(ethers.utils.formatEther(tradeData?.lowestSale)) *
												wildPriceUsd,
									  )
									: 0
						  }`
						: '',
			},
			{
				fieldName: 'Volume',
				title: (tradeData?.volume as any)?.all
					? `${formatEthers((tradeData?.volume as any)?.all)} WILD`
					: '',
				subTitle:
					wildPriceUsd > 0
						? `$${
								(tradeData?.volume as any)?.all
									? formatNumber(
											Number(
												ethers.utils.formatEther(
													(tradeData?.volume as any)?.all,
												),
											) * wildPriceUsd,
									  )
									: 0
						  }`
						: '',
			},
		];

		return (
			<>
				<div className={styles.Stats}>
					{data.map((item) => (
						<>
							{!item.isHidden ? (
								<StatsWidget
									className="normalView"
									fieldName={item.fieldName}
									isLoading={!statsLoaded}
									title={item.title}
									subTitle={item.subTitle}
									style={{
										width: width,
									}}
								></StatsWidget>
							) : null}
						</>
					))}
				</div>
			</>
		);
	};

	const previewCard = () => {
		const isVisible = domain !== '/' && !isNftView;
		let to;
		if (isVisible && previewCardRef) {
			// If should be visible, slide down
			to = { opacity: 1, marginTop: 0, marginBottom: 0 };
		} else {
			// If root view, slide up
			to = {
				opacity: 0,
				marginTop: -(previewCardRef?.current?.clientHeight || 0) - 12,
				marginBottom: 16,
			};
		}

		return (
			<>
				{/* Preview Card */}
				<Spring to={to}>
					{(styles) => (
						<animated.div style={styles}>
							<div ref={previewCardRef}>
								<CurrentDomainPreview />
							</div>
						</animated.div>
					)}
				</Spring>
			</>
		);
	};

	const subTable = useMemo(() => {
		return (
			<SubdomainTable
				style={{ marginTop: 16 }}
				domainName={domain}
				isNftView={isNftView}
			/>
		);
	}, [domain, isNftView]);

	////////////
	// Render //
	////////////

	return (
		<>
			{/* TODO: Convert page width into a hook to add condition here */}
			{modal === Modal.Transfer && (
				<TransferOwnership
					metadataUrl={znsDomain?.metadata ?? ''}
					domainName={domain}
					domainId={znsDomain?.id ?? ''}
					onTransfer={closeModal}
					creatorId={znsDomain?.minter?.id || ''}
					ownerId={znsDomain?.owner?.id || ''}
				/>
			)}
			{/* ZNS Content */}
			<BannerContainer isScrollDetectionDown={isScrollDetectionDown}>
				{/* Temporarily removed Raffle */}
				<WheelsRaffle />
				{/* <MessageBanner
						label="This is a banner message"
						buttonText="CTA"
						countdownTime={3634408000000}
					/> */}
			</BannerContainer>

			{!isNftView && (
				<div
					className="background-primary border-primary border-rounded"
					style={{
						background: 'var(--background-primary)',
						overflow: 'hidden',
					}}
				>
					{previewCard()}
					{nftStats()}
					{showDomainTable && subTable}
				</div>
			)}

			{znsDomain && isNftView && (
				<Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
					{(styles) => (
						<animated.div style={styles}>
							<NFTView
								domain={domain}
								onTransfer={openTransferOwnershipModal}
							/>
						</animated.div>
					)}
				</Spring>
			)}
		</>
	);
};

export default ZNS;
