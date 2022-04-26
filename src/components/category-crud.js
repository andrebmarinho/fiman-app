import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    TextField,
    IconButton,
    Grid
} from '@mui/material';
import {
    Delete,
    AddCircle,
    Create
} from '@mui/icons-material';

import Service from '../services/category.service';

const CategoryCrud = () => {
    const [rowCountState, setRowCountState] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [categories, setCategories] = useState([]);
    const [viewForm, setViewForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [descriptionField, setDescriptionField] = useState('');

    useEffect(() => {
        retrieveCategories(page);
    }, [page, refreshData]);

    const renderCells = (params) => {
        return (
            <Grid
                container
                spacing={0}
                alignItems='center'
            >
                <Grid item xs={10}>
                    {params.row.description}
                </Grid >

                <Grid item xs={2}>
                    <IconButton
                        aria-label='Editar'
                        onClick={() => {
                            editCategory(params.row);
                        }}
                    >
                        <Create />
                    </IconButton>
                    <IconButton
                        aria-label='Remover'
                        onClick={() => {
                            removeCategory(params.row.id);
                        }}
                    >
                        <Delete />
                    </IconButton>
                </Grid >
            </Grid>
        )
    }

    const handlePageChange = (newPage) => {
        setPage(newPage);
    }

    const retrieveCategories = (page) => {
        Service.get(page).then(response => {
            const categs = response.data.categories;
            const count = response.data.count;

            if (count) {
                setRowCountState(count);
            }

            categs.forEach(el => {
                el['id'] = el['_id'];
            });

            setCategories(categs);
            setLoading(false);
        }).catch(err => {
            console.log(err);
        });
    }

    const removeCategory = (id) => {
        Service.delete(id).then(() => {
            setRefreshData(!refreshData);
        }).catch(err => {
            console.log(err);
        })
    }

    const editCategory = (category) => {
        setEditId(category.id);
        showForm(category.description);
    }

    const handleDescriptionChange = (event) => {
        setDescriptionField(event.target.value);
    }

    const save = () => {
        const categ = {
            description: descriptionField
        }

        if (editId) {
            Service.update(editId, categ).then(response => {              
                setRefreshData(!refreshData);
                closeForm();
            }).catch(err => {
                console.log(err);
            });
        } else {
            Service.create(categ).then(response => {
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
        setViewForm(false);
    }

    const showForm = (description) => {
        setViewForm(true);
        console.log(description)
        setDescriptionField(description || '');
    }

    const columns = [
        {
            field: 'description',
            headerName: 'Descrição',
            flex: 1,
            renderCell: renderCells
        },

    ];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <Box sx={{ p: 5 }}>
                    <DataGrid
                        autoHeight
                        rows={categories}
                        columns={columns}
                        pagination
                        pageSize={5}
                        disableSelectionOnClick
                        paginationMode='server'
                        rowsPerPageOptions={[5]}
                        rowCount={rowCountState}
                        onPageChange={handlePageChange}
                        page={page}
                        loading={loading}
                    />

                    {!viewForm ? (
                        <Button
                            sx={{ mt: 2 }}
                            onClick={() => showForm()}
                        >
                            Adicionar categoria
                        </Button>
                    ) : (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label='Descrição'
                                variant='standard'
                                value={descriptionField}
                                onChange={handleDescriptionChange}
                            />
                            <Button
                                sx={{ mt: 2, ml: 2 }}
                                variant='outlined'
                                startIcon={<AddCircle />}
                                onClick={() => save()}
                                disabled={!descriptionField}
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

export default CategoryCrud;