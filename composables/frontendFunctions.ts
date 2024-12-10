// general
export const selectAllOnFocus = (event: FocusEvent) => {
    const input = event.target as HTMLInputElement
    input.select()
}

