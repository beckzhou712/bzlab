---
title: Integrating AutoDDG into Auctus
author: Beck Zhou
pubDatetime: 2026-08-14T10:00:00-04:00
description: "How I integrated AutoDDG into Auctus v2: where it fits in the pipeline, the design decisions along the way, and shipping it to PyPI."
tags:
  - vida
---

## Introduction

My first project has been integrating AutoDDG into Auctus v2. I have written two posts covering AutoDDG and Auctus in some detail. In short, Auctus is a search engine that brings together a number of public data portals, and many of the datasets in it come with poor original descriptions: they can be too brief, inconsistent with what the dataset actually contains, or missing altogether. This causes two problems. First, what users see is hard to read, uninformative, and potentially even misleading. Second, because the dataset search systems these portals support typically run keyword queries against metadata such as dataset name, description, and size, retrieval accuracy inevitably suffers. Auctus does support richer queries — **spatial and temporal queries** and **data integration queries** — but these are still, at bottom, upgrades built on top of keyword search; the engine is a keyword-query engine after all. So I am using AutoDDG to automatically generate descriptions for the datasets in Auctus that are readable, informative, and faithful to the dataset's contents, in an attempt to address both problems.

A simple analogy: Auctus is a library (the dataset portal) that brings in books (datasets) from all over the world. The library has to inspect each book (profiling, with the Atlas Profiler), write a blurb for it (the dataset description, with AutoDDG), file that blurb away (indexing, with OpenSearch), and put the book on the shelf (storage, with MinIO). When a customer comes to buy a book, they type the subject they are interested in into the system, and Auctus uses the blurbs in the index to find the relevant books. The better the blurb is written — the more faithfully it represents the book's contents — the more likely the customer is to get the book they wanted.

## The steps

### 1. Where AutoDDG fits in the pipeline

Where to insert AutoDDG is fairly intuitive. As the analogy already says, it goes after profiling and before indexing and storage, because AutoDDG needs the profiler's output to generate a description, and the whole point is to use that description for the index. I built in a soft-failure design here: even if AutoDDG fails to generate a description, ingestion is unaffected, and the system automatically falls back to the description the dataset came with from its source (and if there is no original description, the book simply goes without a blurb). That said, AutoDDG almost never runs into trouble; soft failure is only triggered when an LLM call fails.

### 2. Trimming the profile

The profiler produces a very, very long JSON for each dataset, much of which is really just noise as far as description generation is concerned (runtime-level information such as how long each profiling step took, for instance). I chose to trim it and pass only the trimmed subset to AutoDDG as the grounding context for generating the dataset description. At the dataset level, what is kept is row count, column count, the set of data types, geographic extent, and date range. Those two coverage fields, geographic extent and date range, are only emitted when the profiler can derive them from the dataset's own data. If a field is absent, it means the dataset does not involve geographic or date information, not that profiling failed. At the column level, what is kept is the column name, data type, semantic type (when the profiler can identify one), and descriptive statistics. I also designed the trimming to adapt to the width of the table, because always supplying complete per-column statistics for wide tables produces an enormous profile. All of these trimming rules are, of course, just hardcoded in the script, so they can be adjusted at any time.

### 3. Feeding the LLM a data sample

For the LLM to understand a dataset's contents, feeding it a small data sample on top of the profile works better than the profile alone. I had the system pass the table header and up to 20 rows of data to the LLM as a real sample when processing each dataset. This sample is used only for writing the description; it does not go into the index (otherwise it would bloat and slow down the search system, and dilute it).

### 4. Pinning dependency versions

AutoDDG and Auctus each depend on a fair number of third-party libraries, and their versions can clash. I was running on my own 2020 Intel Mac at the time and ran into exactly that: the numpy versions AutoDDG and Auctus support on Intel macOS conflicted. That pushed me to put together a requirements.txt pinning the key libraries to mutually compatible versions.

### 5. Containerization and the LLM client

I integrated AutoDDG into Auctus' containerized runtime and used Compose plus environment variables to manage dependencies and configuration in one place, so that the whole system can be deployed in a single command. AutoDDG also involves LLM calls, and it supports either a local model or an OpenAI-compatible client. More precisely, AutoDDG's constructor asks for a client to be passed in, and that client is the one constructed on the Auctus side. I am obviously not flush enough to use my own compute and API credits, so I asked the lab for NYU's Portkey. It is compliant, billing is centralized, and it supports a range of models (not an exhaustive range, but more than enough) — and, more importantly, I do not have to spend my own money.

### 6. Documentation and demo

Finally, I updated the README in the Auctus repo with a complete walkthrough for getting everything running from scratch. I gave a live demo on my own machine at a group meeting, showing everyone the `autoddg_description` stored in OpenSearch and MinIO. The frontend had not been deployed at that point and was still showing only the original descriptions; now, thanks to my mentor Sonia's work, the frontend displays the AutoDDG descriptions.

### Diagram

```
ingestion pipeline (run_pipeline_ingest.py)
        │  pushes each dataset task onto the Redis queue
        ▼
   Redis (arq queue)
        │
        ▼
  arq-worker container  ← this is where the integration happens
   process_dataset_task():
     1. build_validation_record()  grabs the CSV sample + atlas-profiler metadata
     2. attach_autoddg_description()  ← AutoDDG is called at this step
          ├─ get_autoddg(): Portkey client + AutoDDG instance (lazy-loaded, globally cached)
          ├─ build_profile_text(): trims the profiler metadata into a structured profile
          └─ autoddg.describe_dataset(sample, profile) → LLM → description text
     3. upload_heavy_profile() → MinIO (stores the full profile, description included)
     4. attach_embedding() → vector
     5. os_client.index() → OpenSearch (the autoddg_description field goes into the search document)
```

## Other

At the group's request, I also published AutoDDG to PyPI. Using AutoDDG now takes nothing more than `pip install autoddg`. In fact, a group member had already created a dedicated release branch and gotten most of this done. That branch sets up a GitHub Actions pipeline with a version-manager bot A and a shipping-clerk bot B: I click the bump version button on the GitHub website, bot A changes the version number and tags it, and then bot B runs the quality checks, builds the package, and publishes it automatically. I only handled the finishing touches (creating the PYPI_TOKEN, going through TestPyPI, publishing under my account). Since the release, Auctus calls AutoDDG straight from PyPI, with zero changes to the rest of the code. It is at <https://pypi.org/project/autoddg>, with ~1.5k+ downloads in the first month. Support welcome.
