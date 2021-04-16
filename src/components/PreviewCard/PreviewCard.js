import React, { useState } from 'react';

import FutureButton from '../Buttons/FutureButton/FutureButton.js';
import Enlist from '../Enlist/Enlist'
import { Modal } from 'antd';
import { any } from 'zod';

import styles from './PreviewCard.module.css';

const templateNFT = 'assets/nft/redpill.png';

const PreviewCard = (props) => {

  const [ enlistOpen, setEnlistOpen ] = useState(false)

  const enlist = () => setEnlistOpen(true)

  return (
    <div
      className={`${styles.PreviewCard} border-primary border-rounded blur`}
      style={props.style}
    >
      <div
        className={styles.Asset}
        style={{ backgroundImage: `url(${props.img})` }}
      ></div>
      <div className={styles.Body}>
        <div>
          <h5 className={'glow-text-blue'}>{props.name}</h5>
          <span className={styles.Domain}>{props.domain}</span>
        </div>
        <p>{props.description}</p>
        <div className={styles.Members}>
          <div>
            <div
              className={styles.Dp}
              style={{backgroundImage: `url(${props.creator.img})`}}
            ></div>
            <div className={styles.Member}>
              <span>{props.creator.domain}</span>
              <br />
              <span>Creator</span>
            </div>
          </div>
          <div>
            <div
              className={styles.Dp}
              style={{backgroundImage: `url(${props.owner.img})`}}
            ></div>
            <div className={styles.Member}>
              <span>{props.owner.domain}</span>
              <br />
              <span>Owner</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.Buy}>
        <FutureButton 
          glow 
          style={{ height: 36, width: 118, borderRadius: 30 }}
          onClick={enlist}
        >
          ENLIST
        </FutureButton>
        <span className={`glow-text-white`}>
          {' '}
          <span className={`glow-text-blue`}></span>
        </span>
        <span className={`glow-text-blue`}></span>
      </div>

      <Modal
          style={{
            position: 'relative',
            margin: 0,
            padding: 0,
            // border: '2px solid red',
          }}
          bodyStyle={{ height: '80vh' }}
          closeIcon={null}
          centered
          visible={enlistOpen}
          onCancel={() => setEnlistOpen(false)}
          footer={null}
          closable={false}
        >
        <Enlist name={''} props={any} />
      </Modal>
    </div>
  );
};

export default PreviewCard;
