// Vite supplies '/' locally and '/afterimage/' for the Pages build.
export const assetUrl=path=>`${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
