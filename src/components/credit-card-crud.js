import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip,
    Autocomplete
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create,
    CurrencyExchange
} from '@mui/icons-material';

import Service from '../services/credit-card.service.js';
import BankAccountService from '../services/bank-account.service.js';
import CurrencyHelper from '../helpers/currency.helper.js';

const CreditCardCrud = () => {
    const navigate = useNavigate();

    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [bankAccounts, setBankAccounts] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [descriptionField, setDescriptionField] = useState('');
    const [bankAccountField, setBankAccountField] = useState(null);

    useEffect(() => {
        retrieveCreditCards(page);
    }, [page, refreshData]);

    const renderActionsButtons = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={6}>
                    {CurrencyHelper.formatCurrency(params.row.balance)}
                </Grid >
                <Grid item xs={6}>
                    <Tooltip title='Transações' placement='top-start'>
                        <IconButton
                            aria-label='Transações'
                            color='warning'
                            onClick={() => {
                                navigate('/transactions/credit-card/' + params.row.id);
                            }}
                        >
                            <CurrencyExchange />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Editar' placement='top-start'>
                        <IconButton
                            aria-label='Editar'
                            color='primary'
                            onClick={() => {
                                editCreditCard(params.row);
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
                                removeCreditCard(params.row.id);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    }

    const retrieveBankAccounts = async (description) => {
        try {
            const response = await BankAccountService.get(0, description);
            console.log('BankAccs: ', response);
            await setBankAccounts(response.data.result);
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }

    const onAutoCompleteInputChanges = (event) => {
        if (event) {
            const value = event?.target.value;
            if (value?.length > 1) {
                if (bankAccounts.indexOf(ba => ba.description.toLowerCase().includes(value.toLowerCase())) === -1) {
                    retrieveBankAccounts(value);
                }
            }
        }
    }

    const getBankAccountsDescription = (bankAccount) => {
        return bankAccount ? bankAccount.description : '';
    }

    const retrieveCreditCards = async (page) => {
        try {
            const response = await Service.get(page);
            const responseData = response.data;
            const count = responseData.count;
            const cards = responseData.result;

            cards.forEach(el => {
                el['id'] = el['_id'];
            });

            setCreditCards(cards);
            setLoading(false);

            if (count) {
                setRowCountState(count);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const removeCreditCard = async (id) => {
        try {
            await Service.delete(id);
            setRefreshData(!refreshData);
        } catch (err) {
            console.log(err);
        }
    }

    const editCreditCard = async (creditCard) => {
        await retrieveBankAccounts(creditCard.bankAccount.description);
        await setEditId(creditCard.id);
        showForm(creditCard);
    }

    const save = () => {
        const card = {
            description: descriptionField,
            bankAccount: bankAccountField
        }

        if (editId) {
            Service.update(editId, card).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            card.balance = 0.00;
            Service.create(card).then(response => {
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
        setBankAccountField(null);
        setViewForm(false);
    }

    const showForm = (card) => {
        setDescriptionField(card?.description || '');
        setBankAccountField(card?.bankAccount || '');
        setViewForm(true);
    }

    const isBankAccountEqualToValue = (option, value) => {
        return option?._id === value?._id;
    }

    const columns = [
        {
            field: 'description',
            headerName: 'Cartão',
            flex: 1,
        },
        {
            field: 'bankAccount',
            valueFormatter: (params) => params.value?.description,
            headerName: 'Conta Bancária',
            flex: 1,
        },
        {
            field: 'balance',
            headerName: 'Saldo da última fatura',
            flex: 1,
            renderCell: renderActionsButtons
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Box sx={{ p: 5 }}>
                    <DataGrid
                        autoHeight
                        rows={creditCards}
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
                            Adicionar Cartão de Crédito
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
                            <Box sx={{ width: 200 }}>
                                <Autocomplete
                                    disablePortal
                                    id="autocomplete-bank-accounts"
                                    options={bankAccounts}
                                    noOptionsText='Não encontrado'
                                    loadingText='Carregando...'
                                    disableClearable
                                    getOptionLabel={getBankAccountsDescription}
                                    fullWidth
                                    onInputChange={onAutoCompleteInputChanges}
                                    renderInput={(params) => <TextField {...params} label="Conta Bancária" />}
                                    value={bankAccountField}
                                    onChange={(event, bankAccount) => {
                                        setBankAccountField(bankAccount);
                                    }}
                                    isOptionEqualToValue={isBankAccountEqualToValue}
                                />
                            </Box>

                            <Button
                                sx={{ mt: 2, ml: 2 }}
                                variant='outlined'
                                startIcon={<AddCircle />}
                                onClick={() => save()}
                                disabled={!descriptionField || !bankAccountField}
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

export default CreditCardCrud;