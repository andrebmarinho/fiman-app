import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button, 
    Container
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const pages = [
    {
        name: 'Home',
        path: ''
    },
    {
        name: 'Categorias',
        path: 'categories'
    },
    {
        name: 'Contas Bancárias',
        path: 'bank-accounts'
    },
    {
        name: 'Cartões de Crédito',
        path: 'credit-cards'
    }
];

const NavBar = () => {
    const navigate = useNavigate();

    const goToPage = (page) => {
        navigate('/' + page.path);
    }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ mr: 2, display: 'flex' }}
                    />

                    <Box sx={{ flexGrow: 1, display: 'flex' }}>
                        {pages.map((page) => (
                            <Button
                                key={page.path}
                                onClick={() => goToPage(page)}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >{page.name}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default NavBar;
