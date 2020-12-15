import Big from 'big.js'
import { BigNumber } from 'ethers/utils'
import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks'
import { getWrapToken, pseudoNativeAssetAddress } from '../../../../util/networks'
import { getOutcomeColor } from '../../../../theme/utils'
import { formatBigNumber, formatNumber, mulBN } from '../../../../util/tools'
import { BalanceItem, BondItem, OutcomeTableValue, Token, TokenEthereum } from '../../../../util/types'
import { RadioInput, TD, TH, THead, TR, Table } from '../../../common'
import { BarDiagram } from '../bar_diagram_probabilities'
import { OutcomeItemLittleBallOfJoyAndDifferentColors, OutcomeItemText, OutcomeItemTextWrapper } from '../common_styled'
import { NewValue } from '../new_value'
import { WinningBadge } from '../winning_badge'

interface Props {
  balances: BalanceItem[]
  collateral: Token
  disabledColumns?: OutcomeTableValue[]
  displayRadioSelection?: boolean
  outcomeHandleChange?: (e: number) => void
  outcomeSelected?: number
  payouts?: Maybe<Big[]>
  probabilities: number[]
  newShares?: Maybe<BigNumber[]>
  newBonds?: BondItem[]
  withWinningOutcome?: boolean
  showPriceChange?: boolean
  showSharesChange?: boolean
  showBondChange?: boolean
  isBond?: boolean
  bonds?: BondItem[]
}

const TableWrapper = styled.div`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
`

const PaddingCSS = css`
  padding-left: 25px;
  padding-right: 0;

  &:last-child {
    padding-right: 25px;
  }
`

const TRExtended = styled(TR as any)<{ clickable?: boolean }>`
  cursor: ${props => (props.clickable ? 'pointer' : 'default')};

  &:hover td {
    background-color: ${props => (props.clickable ? '#fafafa' : 'transparent')};
  }
`

TRExtended.defaultProps = {
  clickable: false,
}

const THStyled = styled(TH as any)`
  ${PaddingCSS}
`

const TDStyled = styled(TD as any)`
  ${PaddingCSS}
`
const TDRadio = styled(TD as any)`
  ${PaddingCSS}
  width: 20px;
`

const TDFlexDiv = styled.div<{ textAlign?: string }>`
  align-items: center;
  display: flex;
  justify-content: ${props =>
    props.textAlign && 'right' ? 'flex-end' : props.textAlign && 'center' ? 'center' : 'flex-start'};
`

const WinningBadgeStyled = styled(WinningBadge)`
  flex-grow: 1;
  margin-right: auto;
`

const BondRadioInput = styled(RadioInput)`
  margin-right: 16px;
`

export const OutcomeTable = (props: Props) => {
  const {
    bonds = [],
    isBond = false,
    showBondChange = false,
    balances,
    collateral,
    disabledColumns = [],
    displayRadioSelection = true,
    newShares = null,
    outcomeHandleChange,
    outcomeSelected,
    payouts = [],
    probabilities,
    withWinningOutcome = false,
    showPriceChange = false,
    showSharesChange = false,
    newBonds,
  } = props

  let winningBondIndex = -1
  bonds.forEach((bond, bondIndex) => {
    if ((winningBondIndex === -1 || bonds[winningBondIndex].bondedEth.lt(bond.bondedEth)) && bond.bondedEth.gt(0)) {
      winningBondIndex = bondIndex
    }
  })
  const bondRadioVisible = isBond && displayRadioSelection && !withWinningOutcome

  const TableHead: OutcomeTableValue[] = [
    OutcomeTableValue.OutcomeProbability,
    OutcomeTableValue.Outcome,
    OutcomeTableValue.Probability,
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.Shares,
    OutcomeTableValue.Payout,
    OutcomeTableValue.Bonded,
  ]

  const TableCellsAlign = ['left', 'left', 'right', 'right', 'right', 'right', 'right']

  const context = useConnectedWeb3Context()
  const wrapSymbol = getWrapToken(context.networkId).symbol
  const symbol = collateral.address === pseudoNativeAssetAddress ? wrapSymbol : collateral.symbol

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return !disabledColumns.includes(value) ? (
              <THStyled
                colSpan={index === 0 && displayRadioSelection ? 2 : 1}
                key={index}
                style={isBond && index === 1 ? { width: '53%' } : {}}
                textAlign={TableCellsAlign[index]}
              >
                {value} {value === OutcomeTableValue.CurrentPrice && `(${symbol})`}
              </THStyled>
            ) : null
          })}
        </TR>
      </THead>
    )
  }

  const selectRow = useCallback(
    (index: number) => {
      outcomeHandleChange && outcomeHandleChange(index)
    },
    [outcomeHandleChange],
  )

  const renderInvalidRow = (outcomeIndex: number) => {
    const outcomeName = 'Invalid'
    const showBondBadge = isBond && withWinningOutcome && outcomeIndex === winningBondIndex
    const formattedBondedEth =
      bonds && bonds[outcomeIndex] && bonds[outcomeIndex].bondedEth
        ? formatBigNumber(bonds[outcomeIndex].bondedEth, TokenEthereum.decimals)
        : ''
    const formattedNewBondedEth =
      newBonds && newBonds[outcomeIndex].bondedEth
        ? formatBigNumber(newBonds[outcomeIndex].bondedEth, TokenEthereum.decimals)
        : ''
    return (
      <TRExtended
        clickable={displayRadioSelection}
        key={`${outcomeName}-${outcomeIndex}`}
        onClick={() => selectRow(outcomeIndex)}
      >
        {disabledColumns.includes(OutcomeTableValue.Outcome) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>
            {showBondBadge ? (
              <WinningBadge index={outcomeIndex} outcomeName={outcomeName} payouts={null} showPayout={false} />
            ) : (
              <OutcomeItemTextWrapper>
                {bondRadioVisible && (
                  <BondRadioInput
                    checked={outcomeSelected === outcomeIndex}
                    data-testid={`outcome_table_radio_invalid`}
                    name="outcome"
                    onChange={(e: any) => selectRow(+e.target.value)}
                    outcomeIndex={outcomeIndex}
                    value={outcomeIndex}
                  />
                )}
                {!bondRadioVisible && <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={outcomeIndex} />}
                <OutcomeItemText>{outcomeName}</OutcomeItemText>
              </OutcomeItemTextWrapper>
            )}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : (
          <TDStyled textAlign={TableCellsAlign[3]}>
            <TDFlexDiv textAlign={TableCellsAlign[3]}>0.00</TDFlexDiv>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Bonded) ? null : (
          <TDStyled
            style={showBondBadge ? { color: 
                                    (outcomeIndex).darker } : {}}
            textAlign={TableCellsAlign[6]}
          >
            <TDFlexDiv textAlign={TableCellsAlign[6]}>
              {formattedBondedEth}{' '}
              {showBondChange && formattedBondedEth !== formattedNewBondedEth && (
                <NewValue outcomeIndex={outcomeIndex} value={formattedNewBondedEth} />
              )}
            </TDFlexDiv>
          </TDStyled>
        )}
      </TRExtended>
    )
  }

  const renderTableRow = (balanceItem: BalanceItem, outcomeIndex: number) => {
    const { currentPrice, outcomeName, payout, shares } = balanceItem
    const currentPriceFormatted = withWinningOutcome ? payout.toFixed(2) : Number(currentPrice).toFixed(2)
    const probability = withWinningOutcome ? Number(payout.mul(100).toString()) : probabilities[outcomeIndex]
    const newPrice = (probabilities[outcomeIndex] / 100).toFixed(2)
    const formattedPayout = formatBigNumber(mulBN(shares, Number(payout.toString())), collateral.decimals)
    const formattedShares = formatBigNumber(shares, collateral.decimals)
    const isWinningOutcome = payouts && payouts[outcomeIndex] && payouts[outcomeIndex].gt(0)
    const formattedNewShares = newShares ? formatBigNumber(newShares[outcomeIndex], collateral.decimals) : null
    const showBondBadge = isBond && withWinningOutcome && outcomeIndex === winningBondIndex
    const formattedBondedEth =
      bonds && bonds[outcomeIndex] && bonds[outcomeIndex].bondedEth
        ? formatBigNumber(bonds[outcomeIndex].bondedEth, TokenEthereum.decimals)
        : ''
    const formattedNewBondedEth =
      newBonds && newBonds[outcomeIndex].bondedEth
        ? formatBigNumber(newBonds[outcomeIndex].bondedEth, TokenEthereum.decimals)
        : ''

    return (
      <TRExtended
        clickable={displayRadioSelection}
        key={`${outcomeName}-${outcomeIndex}`}
        onClick={() => selectRow(outcomeIndex)}
      >
        {!isBond &&
          (!displayRadioSelection || withWinningOutcome ? null : (
            <TDRadio textAlign={TableCellsAlign[0]}>
              <RadioInput
                checked={outcomeSelected === outcomeIndex}
                data-testid={`outcome_table_radio_${balanceItem.outcomeName}`}
                name="outcome"
                onChange={(e: any) => selectRow(+e.target.value)}
                outcomeIndex={outcomeIndex}
                value={outcomeIndex}
              />
            </TDRadio>
          ))}
        {disabledColumns.includes(OutcomeTableValue.OutcomeProbability) ? null : (
          <TDStyled textAlign={TableCellsAlign[1]}>
            <BarDiagram
              outcomeIndex={outcomeIndex}
              outcomeName={isWinningOutcome ? '' : outcomeName}
              probability={probability}
              selected={outcomeSelected === outcomeIndex}
              winningBadge={
                isWinningOutcome && (
                  <WinningBadgeStyled index={outcomeIndex} outcomeName={outcomeName} payouts={payouts} />
                )
              }
            />
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Outcome) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>
            {showBondBadge ? (
              <WinningBadge index={outcomeIndex} outcomeName={outcomeName} payouts={null} showPayout={false} />
            ) : (
              <OutcomeItemTextWrapper>
                {bondRadioVisible && (
                  <BondRadioInput
                    checked={outcomeSelected === outcomeIndex}
                    data-testid={`outcome_table_radio_${balanceItem.outcomeName}`}
                    name="outcome"
                    onChange={(e: any) => selectRow(+e.target.value)}
                    outcomeIndex={outcomeIndex}
                    value={outcomeIndex}
                  />
                )}
                {!bondRadioVisible && <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={outcomeIndex} />}
                <OutcomeItemText>{outcomeName}</OutcomeItemText>
              </OutcomeItemTextWrapper>
            )}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probability) ? null : (
          <TDStyled textAlign={TableCellsAlign[5]}>{probability.toFixed(2)}%</TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.CurrentPrice) ? null : (
          <TDStyled textAlign={TableCellsAlign[2]}>
            <TDFlexDiv textAlign={TableCellsAlign[2]}>
              {currentPriceFormatted} {showPriceChange && <NewValue outcomeIndex={outcomeIndex} value={newPrice} />}
            </TDFlexDiv>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : (
          <TDStyled textAlign={TableCellsAlign[3]}>
            <TDFlexDiv textAlign={TableCellsAlign[3]}>
              {formattedShares}{' '}
              {showSharesChange && formattedNewShares !== formattedShares && (
                <NewValue outcomeIndex={outcomeIndex} value={formattedNewShares && formatNumber(formattedNewShares)} />
              )}
            </TDFlexDiv>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>
            {withWinningOutcome && payouts ? formatNumber(formattedPayout) : '0.00'}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Bonded) ? null : (
          <TDStyled
            style={showBondBadge ? { color: getOutcomeColor(outcomeIndex).darker } : {}}
            textAlign={TableCellsAlign[6]}
          >
            <TDFlexDiv textAlign={TableCellsAlign[6]}>
              {formattedBondedEth}{' '}
              {showBondChange && formattedBondedEth !== formattedNewBondedEth && (
                <NewValue outcomeIndex={outcomeIndex} value={formattedNewBondedEth} />
              )}
            </TDFlexDiv>
          </TDStyled>
        )}
      </TRExtended>
    )
  }

  const renderTable = () => balances.map((balanceItem: BalanceItem, index) => renderTableRow(balanceItem, index))

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>
        {renderTable()}
        {isBond && renderInvalidRow(balances.length)}
      </Table>
    </TableWrapper>
  )
}
