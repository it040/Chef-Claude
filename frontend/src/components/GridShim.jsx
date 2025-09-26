import React from 'react';
import MuiGrid from '@mui/material/Grid';

// Shim to allow legacy props (item, xs/sm/md/lg/xl) with Grid v2
export default function GridShim(props) {
  const {
    item, // legacy, unused in v2
    zeroMinWidth, // legacy, ignore
    xs, sm, md, lg, xl,
    size: sizeProp,
    ...rest
  } = props;

  // Build size from legacy breakpoint props if provided
  let size = sizeProp;
  if (size == null) {
    const bp = {};
    if (xs !== undefined) bp.xs = xs === true ? 'grow' : xs;
    if (sm !== undefined) bp.sm = sm === true ? 'grow' : sm;
    if (md !== undefined) bp.md = md === true ? 'grow' : md;
    if (lg !== undefined) bp.lg = lg === true ? 'grow' : lg;
    if (xl !== undefined) bp.xl = xl === true ? 'grow' : xl;
    if (Object.keys(bp).length > 0) size = bp;
  }

  return <MuiGrid {...rest} {...(size != null ? { size } : {})} />;
}
