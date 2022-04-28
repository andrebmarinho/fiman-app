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
    Create
} from '@mui/icons-material';

import Service from '../services/bank-account.service.js';

const BankAccountCrud = () => {
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

    const formatCurrency = (amount) => {
        let amtStr = amount.toString();
        let formattedString;

        let amtStrParts = amtStr.split('.');

        const integerPart = amtStrParts[0];
        let integerPartFormattedReversed = '';
        for (let c = 0, i = integerPart.length - 1; i >= 0 ; i--, c++) { 
            if (c < 2) {
                integerPartFormattedReversed += integerPart[i];
            } else {
                integerPartFormattedReversed += i - 1 >= 0 ?
                    integerPart[i] + '.' : integerPart[i];
                c = -1;                
            }
        }

        let integerPartFormatted = '';
        for (let i = integerPartFormattedReversed.length - 1; i >= 0 ; i--) { 
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

    const renderCells = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={9}>
                    {formatCurrency(params.row.balance)}
                </Grid >

                <Grid item xs={3}>
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

    const retrieveBankAccounts = (page) => {
        Service.get(page).then(response => {
            const accs = response.data.bankAccounts;
            const count = response.data.count;

            if (count) {
                setRowCountState(count);
            }

            accs.forEach(el => {
                el['id'] = el['_id'];
            });

            setBankAccounts(accs);
            setLoading(false);
        }).catch(err => {
            console.log(err);
        });
    }

    const removeBankAccount = (id) => {
        Service.delete(id).then(() => {
            setRefreshData(!refreshData);
        }).catch(err => {
            console.log(err);
        })
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
            headerName: 'Descrição',
            flex: 1,
        },
        {
            field: 'balance',
            headerName: 'Saldo',
            flex: 1,
            renderCell: renderCells
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
                            sx={{ mt: 2 }}
                            onClick={() => showForm()}
                        >
                            Adicionar Conta
                        </Button>
                    ) : (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label='Descrição'
                                variant='standard'
                                value={descriptionField}
                                onChange={(event) => setDescriptionField(event.target.value)}
                            />
                            <CurrencyTextField
                                sx={{ ml: 2 }}
                                label='Saldo'
                                variant='standard'
                                decimalCharacter=','
                                digitGroupSeparator='.'
                                value={balanceField}
                                onChange={(event, value) => setBalanceField(value)}
                                currencySymbol='R$'
                            />
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