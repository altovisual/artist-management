import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Helper function to handle errors consistently
const handleError = (error: any, message: string) => {
  console.error(message, error);
  return NextResponse.json({ error: message, details: error.message }, { status: 500 });
};

// GET /api/creative-vault/[artistId]
export async function GET(request: NextRequest, context: any) {
  const { artistId } = context.params;
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { data: items, error } = await supabase
      .from('creative_vault_items')
      .select('*')
      .eq('artist_id', artistId);

    if (error) {
      return handleError(error, 'Failed to fetch creative vault items.');
    }

    return NextResponse.json(items);
  } catch (error) {
    return handleError(error, 'An unexpected error occurred while fetching creative vault items.');
  }
}

// POST /api/creative-vault/[artistId]
export async function POST(request: NextRequest, context: any) {
  const { artistId } = context.params;
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const notes = formData.get('notes') as string;
    const content = formData.get('content') as string | null;
    const file = formData.get('file') as File | null;

    let file_url: string | null = null;

    if (file) {
      const filePath = `${artistId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creative-vault-assets')
        .upload(filePath, file);

      if (uploadError) {
        return handleError(uploadError, 'Failed to upload file to storage.');
      }
      const { data: publicUrlData } = supabase.storage.from('creative-vault-assets').getPublicUrl(uploadData.path);
      file_url = publicUrlData.publicUrl;
    }

    const { data: newItem, error } = await supabase
      .from('creative_vault_items')
      .insert({
        artist_id: artistId,
        type,
        title,
        notes,
        content,
        file_url,
      })
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create creative vault item.');
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return handleError(error, 'An unexpected error occurred while creating creative vault item.');
  }
}

// PUT /api/creative-vault/[artistId]?itemId=[itemId]
export async function PUT(request: NextRequest, context: any) {
  const { artistId } = context.params;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required for updating.' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const notes = formData.get('notes') as string;
    const content = formData.get('content') as string | null;
    const file = formData.get('file') as File | null;
    const removeFile = formData.get('removeFile') === 'true';

    let file_url: string | null | undefined = undefined; // undefined means no change

    if (removeFile) {
      // Delete existing file from storage if requested
      const { data: existingItem, error: fetchError } = await supabase
        .from('creative_vault_items')
        .select('file_url')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        return handleError(fetchError, 'Failed to fetch existing item for file removal.');
      }

      if (existingItem?.file_url) {
        const filePath = existingItem.file_url.split('creative-vault-assets/')[1];
        if (filePath) {
          const { error: deleteError } = await supabase.storage.from('creative-vault-assets').remove([filePath]);
          if (deleteError) {
            return handleError(deleteError, 'Failed to delete old file from storage.');
          }
        }
      }
      file_url = null; // Set file_url to null in DB
    } else if (file) {
      // Upload new file
      const filePath = `${artistId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creative-vault-assets')
        .upload(filePath, file);

      if (uploadError) {
        return handleError(uploadError, 'Failed to upload new file to storage.');
      }
      const { data: publicUrlData } = supabase.storage.from('creative-vault-assets').getPublicUrl(uploadData.path);
      file_url = publicUrlData.publicUrl;
    }

    const updateData: { [key: string]: any } = {
      type,
      title,
      notes,
      content,
    };

    if (file_url !== undefined) {
      updateData.file_url = file_url;
    }

    const { data: updatedItem, error } = await supabase
      .from('creative_vault_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('artist_id', artistId) // Ensure artist owns the item
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update creative vault item.');
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleError(error, 'An unexpected error occurred while updating creative vault item.');
  }
}

// DELETE /api/creative-vault/[artistId]?itemId=[itemId]
export async function DELETE(request: NextRequest, context: any) {
  const { artistId } = context.params;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required for deleting.' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    // First, get the file_url to delete the file from storage
    const { data: itemToDelete, error: fetchError } = await supabase
      .from('creative_vault_items')
      .select('file_url')
      .eq('id', itemId)
      .eq('artist_id', artistId) // Ensure artist owns the item
      .single();

    if (fetchError) {
      return handleError(fetchError, 'Failed to fetch item for deletion.');
    }

    if (itemToDelete?.file_url) {
      const filePath = itemToDelete.file_url.split('creative-vault-assets/')[1];
      if (filePath) {
        const { error: deleteFileError } = await supabase.storage.from('creative-vault-assets').remove([filePath]);
        if (deleteFileError) {
          console.warn('Failed to delete file from storage:', deleteFileError.message); // Log but don't block deletion of DB record
        }
      }
    }

    const { error: deleteError } = await supabase
      .from('creative_vault_items')
      .delete()
      .eq('id', itemId)
      .eq('artist_id', artistId); // Ensure artist owns the item

    if (deleteError) {
      return handleError(deleteError, 'Failed to delete creative vault item.');
    }

    return NextResponse.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    return handleError(error, 'An unexpected error occurred while deleting creative vault item.');
  }
}