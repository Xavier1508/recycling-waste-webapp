const router = useRouter();
const currentPath = router.pathname;
const hideLoginButton = currentPath === "/login" || currentPath === "/signup";
