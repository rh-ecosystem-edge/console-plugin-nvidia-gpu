import * as React from 'react';
import { TopConsumerPopoverProps } from '@openshift-console/dynamic-plugin-sdk'

export const EncoderPopover: React.FC<TopConsumerPopoverProps> = ({  }) => {
    return (
        <>Foo</>
    )
};

export const DecoderPopover: React.FC<TopConsumerPopoverProps> = ({  }) => {
    return (
        <>Bar</>
    )
};

export const popovers = [EncoderPopover, DecoderPopover];
