import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../utils/axiosClient";
import { useForm, useFieldArray } from "react-hook-form";
import { useSelector } from "react-redux";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).min(1, "At least one tag is required"),
  visibleTestCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
    explanation: z.string().min(1, "Explanation is required"),
  })).min(1, "At least one visible test case required"),
  hiddenTestCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
  })).min(1, "At least one hidden test case required"),
  startCode: z.array(z.object({
    language: z.string().min(1),
    initialCode: z.string().min(1, "Initial code is required"),
  })).min(1),
  refranceSolution: z.array(z.object({
    language: z.string().min(1),
    completeCode: z.string().min(1, "Complete code is required"),
  })).min(1),
});

const UpdateProblem = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibleTestCases" });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: "hiddenTestCases" });
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: "tags" });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        // normalize tags: DB stores strings, useFieldArray needs objects
        const normalized = {
          ...data,
          tags: data.tags?.map(t => (typeof t === "string" ? t : t)) || [],
        };
        reset(normalized);
      } catch (error) {
        console.error(error);
        setFetchError("Failed to load problem. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    setIsUpdating(true);
    try {
      await axiosClient.patch(`/problem/update/${id}`, { ...formData, problemCreator: user?._id });
      alert("Problem updated successfully!");
      navigate("/admin");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-yellow-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      <span>Loading problem...</span>
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-red-400">{fetchError}</p>
      <button onClick={() => navigate("/admin/problems")} className="btn btn-sm btn-outline">Go Back</button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Title & Description */}
        <div className="card bg-base-100 shadow-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">Basic Info</h2>
          <div className="form-control">
            <label className="label"><span className="label-text">Title</span></label>
            <input {...register("title")} className={`input input-bordered ${errors.title && "input-error"}`} />
            {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea {...register("description")} className={`textarea textarea-bordered ${errors.description && "textarea-error"}`} rows={5} />
            {errors.description && <span className="text-error text-sm">{errors.description.message}</span>}
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Difficulty</span></label>
            <select {...register("difficulty")} className="select select-bordered w-48">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Tags</h2>
          <div className="space-y-2">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input {...register(`tags.${index}`)} placeholder="Enter tag" className="input input-bordered flex-1" />
                <button type="button" onClick={() => removeTag(index)} className="btn btn-xs btn-error">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => appendTag("")} className="btn btn-sm btn-primary mt-2">Add Tag</button>
          </div>
        </div>

        {/* Visible Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Visible Test Cases</h2>
          {visibleFields.map((field, index) => (
            <div key={field.id} className="border border-base-300 p-3 rounded mb-3 space-y-2">
              <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
              <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
              <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="textarea textarea-bordered w-full" />
              <button type="button" onClick={() => removeVisible(index)} className="btn btn-xs btn-error">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => appendVisible({ input: "", output: "", explanation: "" })} className="btn btn-sm btn-primary">Add Visible</button>
        </div>

        {/* Hidden Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Hidden Test Cases</h2>
          {hiddenFields.map((field, index) => (
            <div key={field.id} className="border border-base-300 p-3 rounded mb-3 space-y-2">
              <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
              <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
              <button type="button" onClick={() => removeHidden(index)} className="btn btn-xs btn-error mt-1">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => appendHidden({ input: "", output: "" })} className="btn btn-sm btn-primary">Add Hidden</button>
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Code Templates</h2>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-6 border border-base-300 rounded p-4">
              <h3 className="font-medium mb-3">{index === 0 ? "C++" : index === 1 ? "Java" : "JavaScript"}</h3>
              <div className="form-control mb-3">
                <label className="label"><span className="label-text text-sm">Initial Code (shown to user)</span></label>
                <textarea {...register(`startCode.${index}.initialCode`)} className="textarea textarea-bordered w-full font-mono text-sm" rows={4} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Reference Solution</span></label>
                <textarea {...register(`refranceSolution.${index}.completeCode`)} className="textarea textarea-bordered w-full font-mono text-sm" rows={4} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="btn btn-primary w-full disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update Problem"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProblem;
