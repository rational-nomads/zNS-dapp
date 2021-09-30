// React Imports
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// Web3 Imports
import { useWeb3React } from '@web3-react/core';
import { useZnsContracts } from 'lib/contracts';
import { Web3Provider } from '@ethersproject/providers';

// Component Imports
import { MintWheelsBanner, Overlay } from 'components';
import MintWheels from './MintWheels';

// Library Imports
import { Stage, DropData, TransactionData } from './types';
import { getBannerLabel, getBannerButtonText } from './labels';
import { useMintProvider } from 'lib/providers/MintProvider';
import {
	getDropData,
	getUserEligibility,
	getBalanceEth,
	getNumberPurchasedByUser,
} from './helpers';

const MintWheelsFlowContainer = () => {
	//////////////////
	// State & Data //
	//////////////////

	const { mintWheels } = useMintProvider();
	const history = useHistory();
	const location = useLocation();

	// Web3 hooks
	const { account, library } = useWeb3React<Web3Provider>();

	// Contracts
	const contracts = useZnsContracts();
	const saleContract = contracts?.wheelSale;

	// Internal State
	const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
	const [canOpenWizard, setCanOpenWizard] = useState<boolean>(false);
	const [numMinted, setNumMinted] = useState<number>(0);

	// Auction data
	const [dropStage, setDropStage] = useState<Stage | undefined>();
	const [wheelsTotal, setWheelsTotal] = useState<number | undefined>();
	const [wheelsMinted, setWheelsMinted] = useState<number | undefined>();
	const [maxPurchasesPerUser, setMaxPurchasesPerUser] = useState<
		number | undefined
	>();

	// User data
	const [isUserWhitelisted, setIsUserWhitelisted] = useState<
		boolean | undefined
	>();
	const [balanceEth, setBalanceEth] = useState<number | undefined>();
	const [numberPurchasedByUser, setNumberPurchasedByUser] = useState<
		number | undefined
	>();

	///////////////
	// Functions //
	///////////////

	const transactionSuccessful = (numWheels: number) => {
		setNumMinted(numMinted + 1); // Increment to trigger re-fetch
	};

	// Open/close the Mint wizard
	const openWizard = () => {
		if (canOpenWizard) {
			setIsWizardOpen(true);
		} else {
			window?.open('https://wilderworld.com/', '_blank')?.focus();
		}
	};

	const closeWizard = () => {
		setIsWizardOpen(false);
	};

	// Toggles to grid view when viewport
	// resizes to below 700px
	const handleResize = () => {
		setCanOpenWizard(window.innerWidth >= 900);
	};

	// Run a few things after the transaction succeeds
	// const transactionSuccessful = (numWheels: number) => {};

	// Submits transaction, feeds status updates
	// back through the callbacks provided by MintWheels
	const onSubmitTransaction = async (data: TransactionData) => {
		const { numWheels, statusCallback, errorCallback, finishedCallback } = data;
		const combinedFinishedCallback = () => {
			transactionSuccessful(numWheels);
			finishedCallback();
		};
		mintWheels(
			numWheels,
			statusCallback,
			combinedFinishedCallback,
			errorCallback,
		);
	};

	const openProfile = () => {
		setIsWizardOpen(false);

		const params = new URLSearchParams(location.search);
		params.set('profile', 'true');
		history.push({
			pathname: location.pathname,
			search: params.toString(),
		});
	};

	/////////////
	// Effects //
	/////////////

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			if (!saleContract) {
				return;
			}

			// Get the data related to the drop
			getDropData(saleContract)
				.then((d) => {
					if (!isMounted) {
						return;
					}
					const primaryData = d as DropData;
					setDropStage(primaryData.dropStage);
					setWheelsTotal(primaryData.wheelsTotal);
					setWheelsMinted(primaryData.wheelsMinted);
					setMaxPurchasesPerUser(primaryData.maxPurchasesPerUser);
				})
				.catch((e) => {
					console.error(e);
				});

			// Get user data if wallet connected
			if (account && library) {
				getUserEligibility(account, saleContract).then((d) => {
					if (isMounted && d !== undefined) {
						setIsUserWhitelisted(d);
					}
				});
				getBalanceEth(library.getSigner()).then((d) => {
					if (isMounted && d !== undefined) {
						setBalanceEth(d);
					}
				});
				getNumberPurchasedByUser(account, saleContract).then((d) => {
					if (isMounted && d !== undefined) {
						setNumberPurchasedByUser(d);
					}
				});
			} else {
				setIsUserWhitelisted(undefined);
				setBalanceEth(undefined);
				setNumberPurchasedByUser(undefined);
			}
		};
		getData();
		return () => {
			isMounted = false;
		};
	}, [account, library, saleContract, numMinted]);

	////////////
	// Render //
	////////////

	return (
		<>
			{canOpenWizard && isWizardOpen && (
				<Overlay open onClose={closeWizard}>
					<MintWheels
						balanceEth={balanceEth}
						dropStage={dropStage}
						isUserWhitelisted={isUserWhitelisted}
						maxPurchasesPerUser={maxPurchasesPerUser}
						numberPurchasedByUser={numberPurchasedByUser}
						onClose={closeWizard}
						onFinish={openProfile}
						onSubmitTransaction={onSubmitTransaction}
						userId={account as string | undefined}
						wheelsMinted={wheelsMinted}
						wheelsTotal={wheelsTotal}
					/>
				</Overlay>
			)}
			<div style={{ position: 'relative', marginBottom: 16 }}>
				<MintWheelsBanner
					title={'Get your ride for the Metaverse '}
					label={getBannerLabel(dropStage, wheelsMinted, wheelsTotal)}
					buttonText={
						canOpenWizard ? getBannerButtonText(dropStage) : 'Learn More'
					}
					onClick={openWizard}
				/>
			</div>
		</>
	);
};

export default MintWheelsFlowContainer;
