import React, { useEffect, useMemo, useState } from 'react';
import { TxData, TxInput, TxOutput } from '@script-wiz/lib-core';
import { Button, Input, Modal } from 'rsuite';
import TransactionInput from './TransactionInput/TransactionInput';
import TransactionOutput from './TransactionOutput/TransactionOutput';
import { useLocalStorageData } from '../../hooks/useLocalStorage';
import { TX_TEMPLATE_ERROR_MESSAGE } from '../../utils/enum/TX_TEMPLATE_ERROR_MESSAGE';
// import { validHex } from '../../utils/helper';
import './TransactionTemplateModal.scss';

type Props = {
  showModal: boolean;
  showModalCallBack: (show: boolean) => void;
  txDataCallBack: (txData: TxData) => void;
  clearCallBack: () => void;
};

const TransactionTemplateModal: React.FC<Props> = ({ showModal, showModalCallBack, txDataCallBack, clearCallBack }) => {
  const txInputInitial = useMemo(() => {
    return {
      previousTxId: '',
      vout: '',
      sequence: '',
      scriptPubKey: '',
      amount: '',
      assetId: '',
    };
  }, []);

  const txOutputInitial = useMemo(() => {
    return {
      scriptPubKey: '',
      amount: '',
      assetId: '',
    };
  }, []);

  const [txInputs, setTxInputs] = useState<TxInput[]>([txInputInitial]);
  const [txOutputs, setTxOutputs] = useState<TxOutput[]>([txOutputInitial]);
  const [version, setVersion] = useState<string>('');
  const [timelock, setTimeLock] = useState<string>('');
  const [currentInputIndex, setCurrentInputIndex] = useState<number>(0);

  const { getTxLocalData, setTxLocalData, clearTxLocalData } = useLocalStorageData<TxData>('txData');

  useEffect(() => {
    if (
      JSON.stringify(txInputs) === JSON.stringify([txInputInitial]) &&
      JSON.stringify(txOutputs) === JSON.stringify([txOutputInitial]) &&
      timelock === '' &&
      version === '' &&
      currentInputIndex === 0
    ) {
      const txData = getTxLocalData();
      if (txData) {
        setTxInputs(txData.inputs);
        setTxOutputs(txData.outputs);
        setVersion(txData.version);
        setTimeLock(txData.timelock);
        setCurrentInputIndex(txData.currentInputIndex);
      }
    }
  }, [currentInputIndex, getTxLocalData, timelock, txInputInitial, txInputs, txOutputInitial, txOutputs, version]);

  const txInputOnChange = (input: TxInput, index: number, checked: boolean) => {
    const newTxInputs = [...txInputs];
    const relatedInputIndex = txInputs.findIndex((input, i) => i === index);

    const newInput = {
      previousTxId: input.previousTxId,
      vout: input.vout,
      sequence: input.sequence,
      scriptPubKey: input.scriptPubKey,
      amount: input.amount,
      assetId: input.assetId,
    };
    newTxInputs[relatedInputIndex] = newInput;
    if (checked) setCurrentInputIndex(index);
    setTxInputs(newTxInputs);
  };

  const txOutputOnChange = (output: TxOutput, index: number) => {
    const newTxOutputs = [...txOutputs];
    const relatedOutputIndex = txOutputs.findIndex((output, i) => i === index);
    const newOutput = {
      scriptPubKey: output.scriptPubKey,
      amount: output.amount,
      assetId: output.assetId,
    };
    newTxOutputs[relatedOutputIndex] = newOutput;
    setTxOutputs(newTxOutputs);
  };

  // const inputValidation = (input: TxInput) => {
  //   if (input.previousTxId.length !== 64 && !validHex(input.previousTxId)) {
  //     return false;
  //   }
  //   if (input.amount.length !== 16 || !validHex(input.amount)) {
  //     return false;
  //   }
  //   if (input.assetId?.length !== 64 || !validHex(input.assetId)) {
  //     return false;
  //   }
  //   if (input.sequence.length !== 8 || !validHex(input.sequence)) {
  //     return false;
  //   }
  //   if (input.vout.length !== 8 || !validHex(input.vout)) {
  //     return false;
  //   }
  //   return true;
  // };

  // const outputValidation = (output: TxOutput) => {
  //   if (output.amount.length !== 16 || !validHex(output.amount)) {
  //     return false;
  //   }
  //   if (output.assetId?.length !== 64 || !validHex(output.assetId)) {
  //     return false;
  //   }
  //   return true;
  // };

  const isValidVersion = version.length !== 8 && version.length !== 0 ? TX_TEMPLATE_ERROR_MESSAGE.VERSION_ERROR : '';
  const isValidTimelock = timelock.length !== 8 && timelock.length !== 0 ? TX_TEMPLATE_ERROR_MESSAGE.TIMELOCK_ERROR : '';

  // const isValidTemplate = txInputs.every(inputValidation) && txOutputs.every(outputValidation) && isValidVersion === '' && isValidTimelock === '';

  const txData: TxData = {
    inputs: txInputs,
    outputs: txOutputs,
    version: version,
    timelock: timelock,
    currentInputIndex,
  };

  return (
    <Modal
      className="tx-template-modal"
      size="lg"
      open={showModal}
      backdrop={false}
      onClose={() => {
        // txDataCallBack(txData);
        showModalCallBack(false);
      }}
    >
      <Modal.Header className="tx-template-modal-header" />
      <Modal.Body>
        <div>
          <div className="tx-template-header">
            <p>Inputs</p>
            <p>Outputs</p>
          </div>

          <div className="tx-template-main">
            <div className="tx-inputs">
              {txInputs.map((input: TxInput, index: number) => {
                const txInput = { input, index, checked: currentInputIndex === index };
                return (
                  <TransactionInput
                    key={index}
                    txInput={txInput}
                    txInputOnChange={txInputOnChange}
                    removeInput={(index: number) => {
                      const newTxInputs = [...txInputs];
                      if (txInputs.length > 1) {
                        newTxInputs.splice(index, 1);
                        setTxInputs(newTxInputs);
                      }
                    }}
                  />
                );
              })}
              <Button
                className="tx-template-button"
                onClick={() => {
                  const newTxInput = txInputInitial;
                  const newTxInputs = [...txInputs];
                  newTxInputs.push(newTxInput);
                  setTxInputs(newTxInputs);
                }}
              >
                + Add New Input
              </Button>
            </div>
            <div className="vertical-line"></div>
            <div className="tx-outputs">
              {txOutputs.map((output: TxOutput, index: number) => {
                const txOutput = { output, index };
                return (
                  <TransactionOutput
                    key={index}
                    txOutput={txOutput}
                    txOutputOnChange={txOutputOnChange}
                    removeOutput={(index: number) => {
                      const newTxOutputs = [...txOutputs];
                      if (txOutputs.length > 1) {
                        newTxOutputs.splice(index, 1);
                        setTxOutputs(newTxOutputs);
                      }
                    }}
                  />
                );
              })}
              <Button
                className="tx-template-button"
                onClick={() => {
                  const newTxOutput = txOutputInitial;
                  const newTxOutputs = [...txOutputs];
                  newTxOutputs.push(newTxOutput);
                  setTxOutputs(newTxOutputs);
                }}
              >
                + Add New Output
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="tx-template-modal-footer">
          <div className="tx-item">
            <div className="tx-modal-label">Tx Version:</div>
            <Input value={version} placeholder="4-bytes" onChange={(value: string) => setVersion(value)} />
            <div className="tx-error-line">{isValidVersion}</div>
          </div>
          <div className="tx-item">
            <div className="tx-modal-label">Tx Timelock:</div>
            <Input
              value={timelock}
              placeholder="4-bytes"
              onChange={(value: string) => {
                setTimeLock(value);
              }}
            />
            <div className="tx-error-line">{isValidTimelock}</div>
          </div>
        </div>
        <Button
          onClick={() => {
            setTxInputs([txInputInitial]);
            setTxOutputs([txOutputInitial]);
            setVersion('');
            setTimeLock('');
            clearCallBack();
            clearTxLocalData();
          }}
        >
          Clear
        </Button>
        <Button
          className="tx-modal-save-button"
          appearance="subtle"
          onClick={() => {
            txDataCallBack(txData);
            showModalCallBack(false);
            setTxLocalData(txData);
            // if (isValidTemplate) {
            //   txDataCallBack(txData);
            //   showModalCallBack(false);
            // }
          }}
          // disabled={!isValidTemplate}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionTemplateModal;
