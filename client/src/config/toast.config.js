const toastConfig = {
    error: props => (
        <ErrorToast
            {...props}
            style={{ backgroundColor: "#f51b35" }}
            text1Style={{
                fontSize: 17
            }}
            text2Style={{
                fontSize: 15
            }}
        />
    ),
    success: props => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: "pink" }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: "400"
            }}
        />
    )
};
