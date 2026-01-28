import { NextRequest, NextResponse } from 'next/server';
import {
    getFormOptions,
    addBrand,
    addDeviceType,
    addModel,
    removeBrand,
    removeDeviceType,
    removeModel
} from '@/lib/data';

export async function GET() {
    const formOptions = getFormOptions();
    return NextResponse.json({ formOptions });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        let updatedOptions;

        switch (type) {
            case 'addBrand':
                updatedOptions = addBrand(data.brand);
                break;
            case 'addDeviceType':
                updatedOptions = addDeviceType(data.brand, data.deviceType);
                break;
            case 'addModel':
                updatedOptions = addModel(data.brand, data.deviceType, data.model);
                break;
            default:
                return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
        }

        return NextResponse.json({ formOptions: updatedOptions });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        let updatedOptions;

        switch (type) {
            case 'removeBrand':
                updatedOptions = removeBrand(data.brand);
                break;
            case 'removeDeviceType':
                updatedOptions = removeDeviceType(data.brand, data.deviceType);
                break;
            case 'removeModel':
                updatedOptions = removeModel(data.brand, data.deviceType, data.model);
                break;
            default:
                return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
        }

        return NextResponse.json({ formOptions: updatedOptions });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
