import React from 'react'
import { useNavigate } from 'react-router';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosClient from '../utils/axiosClient';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

// Zod schema matching your problem schema
const problemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    tags: z.array(z.string().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required'),
    visibleTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required'),
            explanation: z.string().min(1, 'Explanation is required')
        })
    ).min(1, 'At least one visible test case required'),
    hiddenTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required')
        })
    ).min(1, 'At least one hidden test case required'),
    startCode: z.array(
        z.object({
            language: z.enum(['C++', 'Java', 'JavaScript']),
            initialCode: z.string().min(1, 'Initial code is required')
        })
    ).length(3, 'All three languages required'),
    refranceSolution: z.array(
        z.object({
            language: z.enum(['C++', 'Java', 'JavaScript']),
            completeCode: z.string().min(1, 'Complete code is required')
        })
    ).length(3, 'All three languages required')
});

const CreateProblem = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            tags: [''],
            visibleTestCases: [{ input: '', output: '', explanation: '' }],
            hiddenTestCases: [{ input: '', output: '' }],
            startCode: [
                { language: 'C++', initialCode: '' },
                { language: 'Java', initialCode: '' },
                { language: 'JavaScript', initialCode: '' }
            ],
            refranceSolution: [
                { language: 'C++', completeCode: '' },
                { language: 'Java', completeCode: '' },
                { language: 'JavaScript', completeCode: '' }
            ]
        }
    });

    const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
    const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });
    const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: 'tags' });

    const onSubmit = async (data) => {
        try {
            const payload = { ...data, problemCreator: user?._id };
            await axiosClient.post('/problem/create', payload);
            alert('Problem created successfully!');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Title</span></label>
                            <input {...register('title')} className={`input input-bordered ${errors.title && 'input-error'}`} />
                            {errors.title && <span className="text-error">{errors.title.message}</span>}
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Description</span></label>
                            <textarea {...register('description')} className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`} />
                            {errors.description && <span className="text-error">{errors.description.message}</span>}
                        </div>
                        <div className="flex gap-4">
                            <div className="form-control w-1/2">
                                <label className="label"><span className="label-text">Difficulty</span></label>
                                <select {...register('difficulty')} className={`select select-bordered ${errors.difficulty && 'select-error'}`}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Tags</h2>
                    <div className="space-y-2">
                        {tagFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <input {...register(`tags.${index}`)} placeholder="Enter tag" className="input input-bordered flex-1" />
                                <button type="button" onClick={() => removeTag(index)} className="btn btn-xs btn-error">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => appendTag('')} className="btn btn-sm btn-primary mt-2">Add Tag</button>
                    </div>
                </div>

                {/* Test Cases */}
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Visible Test Cases</h2>
                    {visibleFields.map((field, index) => (
                        <div key={field.id} className="border p-4 rounded-lg space-y-2">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => removeVisible(index)} className="btn btn-xs btn-error">Remove</button>
                            </div>
                            <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
                            <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
                            <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="textarea textarea-bordered w-full" />
                        </div>
                    ))}
                    <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-sm btn-primary mt-2">Add Visible Case</button>

                    <h2 className="text-xl font-semibold mt-6 mb-4">Hidden Test Cases</h2>
                    {hiddenFields.map((field, index) => (
                        <div key={field.id} className="border p-4 rounded-lg space-y-2">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => removeHidden(index)} className="btn btn-xs btn-error">Remove</button>
                            </div>
                            <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
                            <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
                        </div>
                    ))}
                    <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-sm btn-primary mt-2">Add Hidden Case</button>
                </div>

                {/* Code Templates */}
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-2">
                            <h3 className="font-medium">{index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}</h3>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Initial Code</span></label>
                                <textarea {...register(`startCode.${index}.initialCode`)} className="textarea textarea-bordered w-full font-mono" rows={6} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Reference Solution</span></label>
                                <textarea {...register(`refranceSolution.${index}.completeCode`)} className="textarea textarea-bordered w-full font-mono" rows={6} />
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4">Create Problem</button>
            </form>
        </div>
    )
}

export default CreateProblem;
