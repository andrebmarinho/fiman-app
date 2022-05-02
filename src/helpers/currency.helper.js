class CurrencyHelper {
    formatCurrency(amount) {
        let amtStr = amount.toString();
        let formattedString;

        let amtStrParts = amtStr.split('.');

        const integerPart = amtStrParts[0];
        let integerPartFormattedReversed = '';
        for (let c = 0, i = integerPart.length - 1; i >= 0; i--, c++) {
            if (c < 2) {
                integerPartFormattedReversed += integerPart[i];
            } else {
                integerPartFormattedReversed += i - 1 >= 0 ?
                    integerPart[i] + '.' : integerPart[i];
                c = -1;
            }
        }

        let integerPartFormatted = '';
        for (let i = integerPartFormattedReversed.length - 1; i >= 0; i--) {
            integerPartFormatted += integerPartFormattedReversed[i];
        }

        if (amtStrParts.length === 1) {
            formattedString = `${integerPartFormatted},00`;
        } else {
            const decimalDigits = amtStrParts[1].length === 1 ?
                '0' + amtStrParts[1] : amtStrParts[1];

            formattedString = `${integerPartFormatted},${decimalDigits}`;
        }

        return `R$ ${formattedString}`;
    }
}

export default new CurrencyHelper();