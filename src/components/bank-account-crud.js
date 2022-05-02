import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid,
    Tooltip
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create,
    CurrencyExchange
} from '@mui/icons-material';

import Service from '../services/bank-account.service.js';
import currencyHelper from '../helpers/currency.helper.js';

const BankAccountCrud = () => {
    const navigate = useNavigate();

    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [bankAccounts, setBankAccounts] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [descriptionField, setDescriptionField] = useState('');
    const [balanceField, setBalanceField] = useState('');

    useEffect(() => {
        retrieveBankAccounts(page);
    }, [page, refreshData]);

    const renderActionsButtons = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={9}>
                    {currencyHelper.formatCurrency(params.row.balance)}
                </Grid >

                <Grid item xs={3}>
                    <Tooltip title='Transações' placement='top-start'>
                        <IconButton
                            aria-label='Transações'
                            color='warning'
                            onClick={() => {
                                navigate('/transactions/bank-account/' + params.row.id);
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
                                editBankAccount(params.row);
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
                                removeBankAccount(params.row.id);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Grid >
            </Grid >
        )
    }

    const retrieveBankAccounts = async (page) => {
        try {
            const response = await Service.get(page);
            const responseData = response.data;
            const count = responseData.count;
            const accs = responseData.result;

            accs.forEach(el => {
                el['id'] = el['_id'];
            });

            setBankAccounts(accs);
            setLoading(false);

            if (count) {
                setRowCountState(count);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const removeBankAccount = async (id) => {
        try {
            await Service.delete(id);
            setRefreshData(!refreshData);
        } catch (err) {
            console.log(err);
        }
    }

    const editBankAccount = (bankAccount) => {
        setEditId(bankAccount.id);
        showForm(bankAccount);
    }

    const save = () => {
        const account = {
            description: descriptionField,
            balance: balanceField
        }

        if (editId) {
            Service.update(editId, account).then(response => {
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            Service.create(account).then(response => {
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
        setBalanceField('');
        setViewForm(false);
    }

    const showForm = (account) => {
        setViewForm(true);
        setDescriptionField(account?.description || '');
        setBalanceField(account?.balance || '');
    }

    const columns = [
        {
            field: 'description',
            headerName: 'Conta Bancária',
            flex: 1,
        },
        {
            field: 'balance',
            headerName: 'Saldo',
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
                        rows={bankAccounts}
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
                            Adicionar Conta
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
                            <Box>
                                <CurrencyTextField
                                    sx={{ mt: 2, ml: 10 }}
                                    required
                                    label='Saldo'
                                    variant='standard'
                                    decimalCharacter=','
                                    digitGroupSeparator='.'
                                    value={balanceField}
                                    onChange={(event, value) => setBalanceField(value)}
                                    currencySymbol='R$'
                                />
                            </Box>

                            <Button
                                sx={{ mt: 2, ml: 2 }}
                                variant='outlined'
                                startIcon={<AddCircle />}
                                onClick={() => save()}
                                disabled={!descriptionField || !balanceField}
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

export default BankAccountCrud;