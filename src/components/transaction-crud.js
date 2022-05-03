import { useParams } from 'react-router-dom';
import { useState, useEffect, forwardRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import Moment from 'react-moment';
import moment from 'moment';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip,
    Input,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create
} from '@mui/icons-material';

import Service from '../services/transaction.service.js';
import currencyHelper from '../helpers/currency.helper.js';
import { IMaskInput } from 'react-imask';

const months = [...Array(12).keys()].map(i => i + 1);
const years = [...Array(20).keys()].map(i => i + 2020);

const TextDateMask = forwardRef(function TextDateMask(props, ref) {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="00/00/0000"
            definitions={{
                '#': /[1-9]/,
            }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const TransactionCrud = () => {
    const params = useParams();

    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [transactions, setTransactions] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [descriptionField, setDescriptionField] = useState('');
    const [referenceField, setReferenceField] = useState('');
    const [monthReferenceField, setMonthReferenceField] = useState(1);
    const [yearReferenceField, setYearReferenceField] = useState(2020);
    const [transactionDateField, setTransactionDateField] = useState('');
    const [transactionValueField, setTransactionValueField] = useState('');
    const [incomeField, setIncomeField] = useState(false);

    useEffect(() => {
        retrieveTransactions(page);
    }, [page, refreshData, referenceField]);

    const renderDateCell = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Moment format='DD/MM/YYYY'>
                    {params.row.transactionDate}
                </Moment>
            </Grid>
        );
    }

    const renderActionsButtons = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item
                    xs={9}
                    sx={ params.row.income ? {color: 'green'} : {color: 'red'} }>
                    {params.row.income ? '+' : '-'} {currencyHelper.formatCurrency(params.row.transactionValue)}
                </Grid >

                <Grid item xs={3}>
                    <Tooltip title='Editar' placement='top-start'>
                        <IconButton
                            aria-label='Editar'
                            color='primary'
                            onClick={() => {
                                editTransaction(params.row);
                            }}
                        >
                            <Create />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Remover' placement='top-start'>
                        <IconButton
                            aria-label='Remover'
                            color='error'
                            onClick={() => {
                                removeTransaction(params.row.id);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Grid >
            </Grid >
        )
    }

    const retrieveTransactions = async (page) => {
        try {
            if (referenceField === '') {
                const today = new Date();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                setMonthReferenceField(month);
                setYearReferenceField(year);
                setReferenceField(`${month < 10 ? '0' + month : month}/${year}`);
                return;
            }

            const query = {};

            if (params.type === 'bank-account') {
                query.bankId = params.id;
            } else {
                query.creditCardId = params.id;
            }

            query.reference = referenceField;

            console.log(query, params);

            const response = await Service.get(page, query);
            const responseData = response.data;
            const count = responseData.count;
            const accs = responseData.result;

            accs.forEach(el => {
                el['id'] = el['_id'];
            });

            setTransactions(accs);
            setLoading(false);

            if (count) {
                setRowCountState(count);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const removeTransaction = async (id) => {
        try {
            await Service.delete(id);
            setRefreshData(!refreshData);
        } catch (err) {
            console.log(err);
        }
    }

    const editTransaction = (transaction) => {
        setEditId(transaction.id);
        showForm(transaction);
    }

    const save = () => {
        console.log(transactionDateField);
        const dateArray = transactionDateField.split('/');
        const day = dateArray[0];
        const month = dateArray[1] - 1;
        const year = dateArray[2];
        console.log(day, month, year);

        const transactionDate = new Date(year, month, day);

        const transaction = {
            description: descriptionField,
            reference: referenceField,
            transactionDate: transactionDate,
            transactionValue: transactionValueField
        }

        if (params.type === 'bank-account') {
            transaction.bankId = params.id;
        } else {
            transaction.creditCardId = params.id;
        }

        if (editId) {
            Service.update(editId, transaction).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            console.log(transaction);
            Service.create(transaction).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        }
    }

    const closeForm = () => {
        setEditId(null);
        setDescriptionField('');
        setTransactionDateField('');
        setTransactionValueField('');
        setViewForm(false);
    }

    const showForm = (transaction) => {
        setDescriptionField(transaction?.description || '');
        setTransactionDateField(transaction ?
            moment(transaction.transactionDate).format('L') :
            ''
        );
        setTransactionValueField(transaction?.transactionValue || '');
        setViewForm(true);
    }

    const onChangeMonthReferenceField = (event) => {
        const referenceArr = referenceField.split('/');
        const month = referenceArr[0];
        const year = referenceArr[1];

        let value = event.target.value;

        setMonthReferenceField(value);

        value = value < 10 ? '0' + value : value.toString();
        if (month === value) return;

        setReferenceField(value + '/' + year);
    }

    const onChangeYearReferenceField = (event) => {
        const referenceArr = referenceField.split('/');
        const month = referenceArr[0];
        const year = referenceArr[1];

        let value = event.target.value;

        setYearReferenceField(value);

        if (year === value.toString()) return;

        setReferenceField(month + '/' + value);
        
    }

    const columns = [
        {
            field: 'description',
            headerName: 'Descrição',
            flex: 1,
        },
        {
            field: 'transactionDate',
            headerName: 'Data',
            flex: 1,
            renderCell: renderDateCell
        },
        {
            field: 'transactionValue',
            headerName: 'Valor',
            flex: 1,
            renderCell: renderActionsButtons
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Grid sx={{ pt: 5 }}
                    container
                    spacing={1}
                    justifyContent='center'
                    alignItems='center'>
                    <Grid item xs={2}>
                        <InputLabel id="select-month-label">Mês</InputLabel>
                        <Select
                            id='select-month'
                            labelId="select-month-label"
                            value={monthReferenceField}
                            onChange={onChangeMonthReferenceField}>
                            {months.map(month => {
                                return (
                                    <MenuItem key={month} value={month}>
                                        {month < 10 ? '0' + month : month}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel id="select-year-label">Ano</InputLabel>
                        <Select
                            id='select-year'
                            labelId="select-year-label"
                            value={yearReferenceField}
                            onChange={onChangeYearReferenceField} >
                            {years.map(year => {
                                return (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Grid>
                </Grid>
                <Box sx={{ p: 5 }}>
                    <DataGrid
                        autoHeight
                        rows={transactions}
                        columns={columns}
                        pagination
                        pageSize={5}
                        disableSelectionOnClick
                        paginationMode='server'
                        rowsPerPageOptions={[5]}
                        rowCount={rowCountState}
                        onPageChange={(newPage) => setPage(newPage)}
                        page={page}
                        loading={loading}
                    />

                    {!viewForm ? (
                        <Button
                            sx={{ mt: 4 }}
                            onClick={() => showForm()}
                        >
                            Adicionar Transação
                        </Button>
                    ) : (
                        <Box
                            style={{ display: 'flex' }}
                            sx={{ mt: 4 }}>
                            <Box sx={{ mr: 2 }}>
                                <TextField
                                    required
                                    label='Descrição'
                                    variant='standard'
                                    value={descriptionField}
                                    onChange={(event) => setDescriptionField(event.target.value)}
                                />
                            </Box>
                            <Box sx={{ mr: 2 }}>
                                <InputLabel htmlFor="date-input">Data</InputLabel>
                                <Input
                                    value={transactionDateField}
                                    onChange={(event) => setTransactionDateField(event.target.value)}
                                    name="text-date-input"
                                    id="date-input"
                                    inputComponent={TextDateMask}
                                />
                            </Box>
                            <Box>
                                <CurrencyTextField
                                    sx={{ mt: 2, ml: 10 }}
                                    required
                                    label='Valor'
                                    variant='standard'
                                    decimalCharacter=','
                                    digitGroupSeparator='.'
                                    value={transactionValueField}
                                    onChange={(event, value) => setTransactionValueField(value)}
                                    currencySymbol='R$'
                                />
                            </Box>

                            <Button
                                sx={{ mt: 2, ml: 2 }}
                                variant='outlined'
                                startIcon={<AddCircle />}
                                onClick={() => save()}
                                disabled={!descriptionField || !transactionValueField || !transactionDateField}
                            >
                                Salvar
                            </Button>
                            <Button
                                sx={{ mt: 2, ml: 2 }}
                                variant='contained'
                                color='error'
                                onClick={() => closeForm()}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    )}
                </Box>
            </div>
        </div>
    );
}

export default TransactionCrud;