import { createClient } from "@/utils/supabase/client";
import { DataProvider, RaRecord } from "react-admin";

// Replace with your Supabase URL and anon key
const supabase = createClient();

export const supabaseDataProvider: DataProvider = {
    getList: async (resource, params) => {
        let query = supabase.from(resource).select("*", { count: "exact" });

        // Handle pagination if it's defined
        if (params.pagination) {
            const { page, perPage } = params.pagination;
            const start = (page - 1) * perPage;
            const end = page * perPage - 1;
            query = query.range(start, end);
        }

        // Handle sorting if it's defined
        if (params.sort) {
            const { field, order } = params.sort;
            query = query.order(field, { ascending: order === "ASC" });
        }

        // Handle filtering if it's defined
        if (params.filter) {
            Object.entries(params.filter).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    },

    getOne: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .select("*")
            .eq("id", params.id)
            .single();

        if (error) throw error;

        return { data: data || {} };
    },

    getMany: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .select("*")
            .in("id", params.ids);

        if (error) throw error;

        return { data: data || [] };
    },

    getManyReference: async (resource, params) => {
        const { data, error, count } = await supabase
            .from(resource)
            .select("*", { count: "exact" })
            .eq(params.target, params.id)
            .range(
                params.pagination.perPage * (params.pagination.page - 1),
                params.pagination.perPage * params.pagination.page - 1
            );

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    },

    create: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .insert(params.data)
            .select();

        if (error) throw error;

        return { data: data ? data[0] : {} };
    },

    update: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .update(params.data)
            .eq("id", params.id)
            .select();

        if (error) throw error;

        return { data: data ? data[0] : {} };
    },

    updateMany: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .update(params.data)
            .in("id", params.ids)
            .select();

        if (error) throw error;

        return { data: params.ids };
    },

    delete: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .delete()
            .eq("id", params.id)
            .select();

        if (error) throw error;

        return { data: data ? data[0] : {} };
    },

    deleteMany: async (resource, params) => {
        const { data, error } = await supabase
            .from(resource)
            .delete()
            .in("id", params.ids)
            .select();

        if (error) throw error;

        return { data: params.ids };
    },
};
