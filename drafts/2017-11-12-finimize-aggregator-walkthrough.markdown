---
layout: post
title:  "The Goals Allocator at Finimize"
description: "a project walkthrough"
date:   2017-11-12 16:02:00 +0100
categories: technical
---

Have you ever tried planning your own financial life? To the second decimal? Past your retirement? It involves reflecting on what your long term goals are, estimating your future income, involving interest and inflation rates along with expected investment returns. Not only do you have to know what these numbers are but you also have to model it so that you can play with different strategies. Should you save for your mortgage or build your pension? Or both? And how? This is a very challenging problem to solve right, now imagine calculating financial plans for thousands of people with different goals and lifestyles.

Finimize MyLife is an application that helps you plan your personal finances. Which means they’re trying to build that technical nightmare of a calculator. I worked with them during my placement year and one of the biggests tasks was to create this calculator.

Matt, CTO at Finimize, already has already written about how each goal works and how its main features are calculated. In this post I’ll go through the “Allocator” which is in charge of taking all these goals together and then telling you how to allocate your funds to a different account.

We only arrived to a happy place after multiple iterations. We found new constraints as we progressed, so there was heavy refactoring involved. We always had code safety in mind, working with people’s money is no joke. Therefore, most of the objects we instantiate around are immutable. We later on started using type checking with Flow, whose linter was only please after excrucianting syntax gymnastics. The first version of the allocator suffered heavy feature creep. Code was hard to follow and tests were hard to maintain as they were idiosyncratic to this first implementation. We then later broke down the monster into a modular and functional routine.

Before we walk through some of the subroutines in the process I want to introduce some lingo. Formally speaking, the allocator takes in goals and outputs buckets. Every goal has values like timeToTarget, targetAmount, preSaved, drawFirst, etc. You can read [Matt's post](https://medium.com/finimize-engineering/how-we-calculate-your-personal-finances-6742d742f682) to see how these are calculated. Additionally, each user has their own plan data, which includes their monthly salary, passive income and saved money (basically, all of the funds currently available to the user). The allocator uses the information from the goals to determine how the money available to the user will flow into what we call buckets. Buckets are the places where the money can go, for now these places can either be an investment account, a savings account or an emergency fund. Each bucket has a now and a weekly variable. The now variable is the amount of money the user should allocate right away to this account. Logically, this money can only be allocated from the user's savings, as the user's salary or passive income is not available to him or her right now. The weekly amount is the amount of money the user is expected to deposit every week in order for him or her to achieve the goal.

Let’s start with the unencumbered functions and then progress towards methods that call other functions and we will end in the one function that encompasses the whole process. At the very bottom we have validators. The validators will simply look into an amount they need to cover, an available amount of money, a time frame it needs to reach it and a rate of growth. The job of this validator is to decide whether the available amount of money will be enough to cover the target in the given time at a given rate. If it is not possible to cover the target amount, the validator will return the amount of money it is short - this amount is called `diff`. Because money from income can be used weekly, where savings can be payed immediately, their validators follow different rules. Here’s the code for the `savingsValidator`:

```javascript
const savingsValidator = (amountToCover: Money, remainingAmount: Money, currency: validCurrencyStrings, timeToTarget: number, rate: number) => {
	let validatorDiff : Money = new Money(0, currency)
	let validatorAlloc : Money = new Money(0, currency)

	if (amountToCover.value === 0) {
		return { validatorDiff, validatorAlloc }
	}

	const canCoverAmount = remainingAmount.greaterThanInc(amountToCover)
	const remainingFV = fv(rate, timeToTarget, new Money(0, currency), remainingAmount)

	if (canCoverAmount) {
		validatorAlloc = pv(rate, timeToTarget, new Money(0, currency), amountToCover)
	} else {
		validatorAlloc =  remainingAmount
		validatorDiff = amountToCover.subtract(remainingFV)
	}

	return { validatorDiff, validatorAlloc }
}
```

If a goal is validated by both income and savings validators and the first validator falls short, the `diff` of the first validator will be the amount to cover for the next validator. And so, the `diff` in the last validator’s output will be the amount of money the whole goal is short of.

To determine the order of the validators, we check some properties in the goal. Because the order of validators can vary, figuring out the logic to make the calls in the right order and passing the updated arguments was tricky to me. The result was a pattern in which the validators were placed in a list to be then called with a wrapper function `runValidators` which consumes the validators list with an accumulator object that holds the arguments. Here is the code for `runValidations`:

```javascript
const runValidations = (acc: validationsAccumulator, validatorObject : validatorObject) : validationsAccumulator => {
	let { validator, currency, remainingAmount, allocKey, timeToTarget, rate } = validatorObject
	let diff = acc.targetAmount || acc.diff

	const { validatorDiff, validatorAlloc } = validator(diff, remainingAmount, currency, timeToTarget, rate)

	let accCopy : validationsAccumulator = {
		savingsAlloc: acc.savingsAlloc,
		incomeAlloc: acc.incomeAlloc,
		diff: validatorDiff
	}
	accCopy[allocKey] = validatorAlloc
	return accCopy
}
```

The accumulator object for `runValidations` contains the amounts allocated from savings and income, and the `diff`.

We continue climbing, now onto the method which calls `runValidations`. The `process` function is in charge of ordering the validators and constructing the initial accumulators. It will then construct an output object which represents the state of the goal after it has been validated. This output object contains the information about which bucket will cover it. Here is the code for the process routine:

```javascript
const process = (acc : ProcessAccumulator, feature: GoalFeatures) => {
	const { remainingSavings, remainingIncome, outputs } = acc
	let { investmentTimeHorizon, goalType, targetAmount, timeToTarget, drawFirst, preSaved, currency, isEdited, rate } = feature

	const validatorObjects = [{
		validator: savingsValidator,
		remainingAmount: remainingSavings,
		allocKey: 'savingsAlloc',
		timeToTarget,
		currency,
		rate
	}, {
		validator: incomeValidator,
		remainingAmount: remainingIncome,
		allocKey: 'incomeAlloc',
		timeToTarget,
		currency,
		rate
	}]

	if (drawFirst === 'income' && preSaved === undefined) validatorObjects.reverse()

	const validationInitialObject = {
		diff: new Money(0, currency),
		incomeAlloc: new Money(0, currency),
		savingsAlloc: new Money(0, currency),
		targetAmount
	}

	if (preSaved !== undefined) {
		if (preSaved.greaterThan(remainingSavings)) {
			preSaved = remainingSavings
		}

		validationInitialObject.savingsAlloc = preSaved
		validationInitialObject.diff = targetAmount.subtract(fv(rate, timeToTarget, new Money(0, 'GBP'), preSaved))
		delete validationInitialObject['targetAmount']
		validatorObjects.shift()
	}

	const { incomeAlloc, savingsAlloc, diff } = validatorObjects.reduce(runValidations, validationInitialObject)

	const output : ProcessOutput = {
		isError: diff.value > 0,
		bucket: {
			bucketType: goalType === 'save-for-emergency' ? 'emergency' : (timeToTarget >= investmentTimeHorizon ? 'investment' : 'savings'),
			now: savingsAlloc,
			monthly: incomeAlloc
		},
		isEdited,
		currency,
		rate,
		targetAmount,
		timeToTarget,
		incomeAvailableToGoal: remainingIncome,
		savingsAvailableToGoal: remainingSavings
	}

	if (output.isError) {
		output.bucket.now = preSaved || remainingSavings
		output.bucket.monthly = remainingIncome
	}

	const accCopy : ProcessAccumulator = {
		outputs: outputs.concat([output]),
		remainingIncome: remainingIncome.subtract(output.bucket.monthly),
		remainingSavings: remainingSavings.subtract(output.bucket.now)
	}

	return accCopy
}
```

Here, you can see how runValidations is being called:

```javascript
ValidatorObjects.reduce(runValidations, validationInitialObject)
```

Now that I’m reviewing the code in order to write this post, I realise that the validation handling could be improved. Rather than having the elements inside the validatorObjects be dictionaries containing the function and arguments, they can simply be the functions with the curried arguments.

It is also viable to replace the reduce pattern and using a wrapper function that instead of having values stored in an accumulator, it keeps those values in local scope while running a `forEach` on the function list that will mutate the scoped values. However, I don’t see any significant benefits.

You will have noticed that the signature of `process` contains an accumulator whose clone is mutated and returned. You guessed right, it’s because `process` is being called by a reduce function in a similar fashion to what we've covered. The process function walks through a list of goals while it determining its outputs. The accumulator will be a dictionary containing an empty array called `outputs`, we will add the output of each goal to this output array. At the end of the reduce call, the accumulator object will contain the full list of the outputs along with a `remainingIncome` and `remainingSavings`.

We can now get an overview from the top, the root function simply called `allocator`. This function will first process the goals like we have covered and then aggregate the outputs to determine how much will be allocated to each bucket in total (in contrast to per goal as the validators do). This is fairly straight forward.

```javascript
const allocator = (state: State) : State => {
	const goalOrder : Array<string> = state.getIn(['plan', 'goalsOrder'])
	const currencyGroups : CurrencyGroups = state.getIn(['plan', 'currencies'])
	const netSavingsReturns : number = state.getIn(['plan', 'savingsReturns'])
	const netInvestmentReturns : number = state.getIn(['plan', 'investmentReturns'])
	const investmentTimeHorizon : number = state.getIn(['plan', 'investmentTimeHorizon'])

	let returnedState = state

	currencyGroups.forEach((crr, crrId) => {
		const currency : validCurrencyStrings = crr.get('currency')

		const goalsList : Array<Goal> = state.get('goals').toIndexedSeq().toArray()
			.sort(goalSorter(goalOrder))
			.filter(goal => goal.get('currencyGroupId') === crrId)
			.filter(goal => goal.get('isFinalised') || goal.get('initialGoalSelection'))

		// The select function will extract the necessary data from every goal
		const featuresList : Array<GoalFeatures> = goalsList.map(select(netSavingsReturns, netInvestmentReturns, investmentTimeHorizon))

		const initialValue : ProcessAccumulator = {
			outputs: [],
			remainingSavings: crr.get('totalSavings'),
			remainingIncome: crr.get('totalIncome')
		}

		// The process function determines the results for every goal and the total remainingSavings and remainingIncome
		const {
			outputs,
			remainingSavings,
			remainingIncome
		} = featuresList.reduce(process, initialValue)

		const bucketsAccumulator : BucketsAccumulator = {
			incomeOverboard: new Money(0, currency),
			buckets: {
				savings: {
					now: new Money(0, currency),
					monthly: new Money(0, currency)
				},
				investment: {
					now: new Money(0, currency),
					monthly: new Money(0, currency)
				},
				emergency: {
					now: new Money(0, currency),
					monthly: new Money(0, currency)
				}
			},
			hasFailed: false
		}

		// accumulateBuckets function will aggregate all the results and determine what's the incomeOverboard and the total buckets
		const { incomeOverboard, buckets } = outputs.reduce(accumulateBuckets, bucketsAccumulator)

		// applyOutputs will merge the results into the goals
		const newGoalsList = goalsList.map(applyOutputs(outputs))

		// listToMap converts the goals array into the expected map so it can be properly merged into the state
		const newGoalsMap = listToMap(newGoalsList)

		returnedState =	returnedState.mergeIn(['plan', 'currencies', crrId], fromJS({
			remainingSavings,
			remainingIncome,
			incomeOverboard,
			buckets
		})).mergeIn(['goals'], newGoalsMap)
	})

	return returnedState
}
```

If you’re wondering why the accumulator function simply takes a state object as an argument and writes into it before returning it, it’s because the context for the whole process is a Redux state manager. This is also very convenient for testing and staying free from side effects.

Thanks for sticking with me all the way through! I hope this has scared you away from trying to handle your own personal finances and trusting Finimize instead. If it hasn't, please do tell us how to improve. Finimize MyLife is in stealth mode still figuring out stuff but they'll soon be in lots of people's lives. If you think this is a problem you can nail then it's worth checking them out - they're [hiring](www.finimize.com/jobs)!
