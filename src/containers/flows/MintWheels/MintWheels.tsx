/*
 This container is for the Mint Wheels flow. It should be
 replaced by a more generic container for minting procedurally
 generated NFTs in the future.
 */

// React Imports
import { useEffect, useState } from 'react';

// Web3 Imports
import { useWeb3React } from '@web3-react/core';

// Component Imports
import Loading from './steps/Loading/Loading';

// Configuration
import { Drop, Stage, WheelQuantity } from './types';
import {
	getDropStage,
	getUserEligibility,
	getWheelQuantities,
	getWildBalance,
} from './helpers';

const MintWheels = () => {
	/*
		Need to know:
			- If user is logged in [1]
			- What stage the drop is in (whitelist, public, or neither) [2]
			- Eligibility of the user (are they on the whitelist) [3]
			- Total wheels in drop [4]
			- Remaining wheels in drop [5]
			- Date drop goes public [6]
	 */

	//////////////////
	// State & Data //
	//////////////////

	const { account } = useWeb3React();

	// Primary data - data this is needed on first render
	const [dropStage, setDropStage] = useState<Stage | undefined>();
	const [userIsEligible, setUserIsEligible] = useState<boolean | undefined>();
	const [wheelsTotal, setWheelsTotal] = useState<number | undefined>();
	const [wheelsMinted, setWheelsMinted] = useState<number | undefined>();
	const [isLoadingPrimaryData, setIsLoadingPrimaryData] =
		useState<boolean>(true);

	// Secondary data - data that isn't needed on first render
	const [wildBalance, setWildBalance] = useState<number | undefined>();

	/////////////
	// Effects //
	/////////////

	// Get all data on enter DOM
	useEffect(() => {
		let isMounted = true;

		setIsLoadingPrimaryData(true);

		// Gets all the data we need initially for step 1
		const getPrimaryData = async () => {
			const [stage, eligible, quantity] = await Promise.all([
				getDropStage(),
				getUserEligibility(),
				getWheelQuantities(),
			]);

			// Unsubscribe if not mounted
			if (!isMounted) {
				return;
			}

			if (
				stage === undefined ||
				eligible === undefined ||
				quantity === undefined
			) {
				// Something went wrong in the loading
				// We shouldn't show the UI if any of these failed - maybe retry?
				setIsLoadingPrimaryData(true);
				return;
			}

			// Need to set a timeout so the "Loading" shows for a little longer
			await new Promise((r) => setTimeout(r, 1200));

			setIsLoadingPrimaryData(false); // Tell the UI the primary data has finished loading

			setDropStage(stage);
			setUserIsEligible(eligible);
			setWheelsTotal(quantity.total);
			setWheelsMinted(quantity.minted);
		};
		getPrimaryData();

		// Gets all the data we can load last (req. > step 2)
		const getSecondaryData = async () => {
			const [wildBalance] = await Promise.all([getWildBalance()]);

			// Unsubscribe if not mounted
			if (!isMounted) {
				return;
			}
		};
		getSecondaryData();

		return () => {
			isMounted = false;
		};
	}, []);

	////////////
	// Render //
	////////////

	return (
		<div>
			{isLoadingPrimaryData && <Loading text={'Loading Wheels Drop'} />}
		</div>
	);
};

export default MintWheels;
