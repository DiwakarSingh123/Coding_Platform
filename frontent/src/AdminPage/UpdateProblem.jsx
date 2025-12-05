import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../utils/axiosClient";
import { useForm, useFieldArray } from "react-hook-form";
import { useSelector } from "react-redux";

// same schema as in CreateProblem
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.enum(["array", "linkedList", "graph", "dp"]),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      })
    )
    .min(1, "At least one visible test case required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one hidden test case required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1, "Initial code is required"),
      })
    )
    .length(3, "All three languages required"),
  refranceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1, "Complete code is required"),
      })
    )
    .length(3, "All three languages required"),
});

const UpdateProblem = () => {
  const { id } = useParams(); // get problem id from URL
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  // fetch problem by id and pre-fill form
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/${id}`);
        reset(data); // pre-fill all fields
      } catch (error) {
        console.error(error);
        alert("Error fetching problem");
      }
    };
    fetchProblem();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        problemCreator: user?._id,
      };
      await axiosClient.put(`/problem/update/${id}`, payload);

      alert("Problem updated successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title & Description */}
        <div className="card bg-base-100 shadow-lg p-6">
          <div className="form-control">
            <label className="label">Title</label>
            <input
              {...register("title")}
              className={`input input-bordered ${errors.title && "input-error"}`}
            />
          </div>

          <div className="form-control">
            <label className="label">Description</label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered ${
                errors.description && "textarea-error"
              }`}
              rows={5}
            />
          </div>
        </div>

        {/* Difficulty + Tags */}
        <div className="card bg-base-100 shadow-lg p-6">
          <div className="flex gap-4">
            <select
              {...register("difficulty")}
              className="select select-bordered"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select {...register("tags")} className="select select-bordered">
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
          </div>
        </div>

        {/* Visible & Hidden Test Cases – same as Create */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold mb-4">Visible Test Cases</h2>
          {visibleFields.map((field, index) => (
            <div key={field.id} className="border p-3 rounded mb-2">
              <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full mb-2" />
              <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full mb-2" />
              <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="textarea textarea-bordered w-full" />
              <button type="button" onClick={() => removeVisible(index)} className="btn btn-xs btn-error mt-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => appendVisible({ input: "", output: "", explanation: "" })} className="btn btn-sm btn-primary">Add Visible</button>
        </div>

        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold mb-4">Hidden Test Cases</h2>
          {hiddenFields.map((field, index) => (
            <div key={field.id} className="border p-3 rounded mb-2">
              <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full mb-2" />
              <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
              <button type="button" onClick={() => removeHidden(index)} className="btn btn-xs btn-error mt-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => appendHidden({ input: "", output: "" })} className="btn btn-sm btn-primary">Add Hidden</button>
        </div>

        {/* StartCode & Reference – same as Create */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="font-semibold mb-4">Code Templates</h2>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-4">
              <h3>{index === 0 ? "C++" : index === 1 ? "Java" : "JavaScript"}</h3>
              <textarea {...register(`startCode.${index}.initialCode`)} className="textarea textarea-bordered w-full mb-2" rows={5} />
              <textarea {...register(`refranceSolution.${index}.completeCode`)} className="textarea textarea-bordered w-full" rows={5} />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary w-full">Update Problem</button>
      </form>
    </div>
  );
};

export default UpdateProblem;
